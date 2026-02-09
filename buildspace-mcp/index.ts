import express from "express";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
    StreamableHTTPServerTransport,
} from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { InMemoryEventStore } from "@modelcontextprotocol/sdk/examples/shared/inMemoryEventStore.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import { z } from "zod";
import { stat } from "node:fs";

const port = process.env.PORT || 8080;
const BACKEND_URL = process.env.BACKEND_URL || "https://buildspace-ai-backend-985437920499.asia-south1.run.app";

interface Milestone {
    sequenceNumber: number;
    title: string;
    description: string;
    completed: boolean;
}

interface LearningPlanContext {
    projectName: string;
    projectDescription: string;
    durationDays: number;
    skillLevel: string;
    milestones: Milestone[];
}

/* -------------------------------------------------------
   MCP SERVER FACTORY (IMPORTANT FIX)
------------------------------------------------------- */

function createServer(planId: string) {
    const server = new McpServer(
        {
            name: "buildspace",
            version: "1.0.0",
        },
        {
            capabilities: {
                tools: {},
                logging: {},
            },
        }
    );

    // Pass the planId to the registration function
    registerAllTools(server, planId);
    return server;
}

/* -------------------------------------------------------
   TOOL REGISTRATION (MOVED INTO A FUNCTION)
------------------------------------------------------- */

function registerAllTools(server: McpServer, planId: string) {
    server.registerTool(
        "get_learning_plan",
        {
            description:
                "Get the full learning plan with all milestones and context",
            inputSchema: z.object({
                planId: z.string(),
            }),
        },
        async () => {
            const plan = await fetchLearningPlanContext(planId);

            return {
                content: [
                    {
                        type: "text",
                        text: formatPlanContext(plan),
                    },
                ],
            };
        }
    );

    server.registerTool(
        "get_current_milestone",
        {
            description:
                "Get the current/next milestone the user should be working on",
            inputSchema: z.object({}),
        },
        async () => {
            const plan = await fetchLearningPlanContext(planId);
            const milestone = getCurrentMilestone(plan);

            if (!milestone) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "🎉 All milestones completed! No current milestone.",
                        },
                    ],
                };
            }

            let response = `Current Milestone: M${milestone.sequenceNumber}\n\n`;
            response += `Title: ${milestone.title}\n`;
            response += `Description: ${milestone.description}\n`;
            response += `Status: ⏳ In Progress\n`;

            return {
                content: [{ type: "text", text: response }],
            };
        }
    );

    server.registerTool(
        "get_socratic_guidance",
        {
            description:
                "Get Socratic guidance for the current milestone to help guide learning",
            inputSchema: z.object({}),
        },
        async () => {
            const plan = await fetchLearningPlanContext(planId);
            const milestone = getCurrentMilestone(plan);

            const prompt = generateSocraticPrompt(plan, milestone);

            return {
                content: [{ type: "text", text: prompt }],
            };
        }
    );

    server.registerTool(
        "get_milestone_details",
        {
            description: "Get detailed information about a specific milestone",
            inputSchema: z.object({
                sequenceNumber: z.number(),
            }),
        },
        async ({ sequenceNumber }) => {
            const plan = await fetchLearningPlanContext(planId);
            const milestone = plan.milestones.find(
                (m) => m.sequenceNumber === sequenceNumber
            );

            if (!milestone) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Milestone M${sequenceNumber} not found in the learning plan.`,
                        },
                    ],
                };
            }

            let response = `Milestone M${milestone.sequenceNumber}\n`;
            response += `=${"=".repeat(50)}\n\n`;
            response += `Title: ${milestone.title}\n`;
            response += `Status: ${milestone.completed ? "✅ Completed" : "⏳ Pending"
                }\n`;
            response += `Description: ${milestone.description}\n\n`;
            response += `Learning Context:\n`;
            response += `- Project: ${plan.projectName}\n`;
            response += `- Skill Level: ${plan.skillLevel}\n`;
            response += `- Overall Duration: ${plan.durationDays} days\n`;

            return {
                content: [{ type: "text", text: response }],
            };
        }
    );

    server.registerTool(
        "get_progress",
        {
            description: "Get progress summary for the learning plan",
           inputSchema: z.object({}),
        },
        async () => {
            const plan = await fetchLearningPlanContext(planId);

            const completed = plan.milestones.filter((m) => m.completed).length;
            const total = plan.milestones.length;
            const percentage = Math.round((completed / total) * 100);

            let response = `Progress Report\n`;
            response += `===============\n\n`;
            response += `Project: ${plan.projectName}\n`;
            response += `Completed: ${completed} / ${total} milestones (${percentage}%)\n\n`;
            response += `Progress Bar: `;

            const filledBars = Math.round((percentage / 100) * 20);
            response += `[${"█".repeat(filledBars)}${"░".repeat(
                20 - filledBars
            )}]\n\n`;

            if (completed === total) {
                response += `🎉 Congratulations! You've completed all milestones!\n`;
            } else {
                const nextMilestone = getCurrentMilestone(plan);
                if (nextMilestone) {
                    response += `Next Up: M${nextMilestone.sequenceNumber} - ${nextMilestone.title}\n`;
                }
            }

            return {
                content: [{ type: "text", text: response }],
            };
        }
    );
}

/* -------------------------------------------------------
   FETCH & PARSE HELPERS (UNCHANGED)
------------------------------------------------------- */

async function fetchLearningPlanContext(
    planId: string
): Promise<LearningPlanContext> {
    try {
        const response = await axios.get(
            `${BACKEND_URL}/api/context/learning-plan/${planId}`,
            { timeout: 10000 }
        );

        return parsePlanContext(response.data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(
                `Failed to fetch learning plan: ${error.message}`
            );
        }
        throw error;
    }
}

function parsePlanContext(contextText: string): LearningPlanContext {
    const lines = contextText.split("\n");
    const plan: LearningPlanContext = {
        projectName: "",
        projectDescription: "",
        durationDays: 0,
        skillLevel: "",
        milestones: [],
    };

    let parsingMilestones = false;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith("Project:")) {
            plan.projectName = trimmed.replace("Project:", "").trim();
        } else if (trimmed.startsWith("Description:")) {
            plan.projectDescription = trimmed.replace("Description:", "").trim();
        } else if (trimmed.startsWith("Duration:")) {
            const match = trimmed.match(/(\d+)/);
            plan.durationDays = match ? parseInt(match[0]) : 0;
        } else if (trimmed.startsWith("Skill Level:")) {
            plan.skillLevel = trimmed.replace("Skill Level:", "").trim();
        } else if (trimmed.includes("Milestones so far:")) {
            parsingMilestones = true;
        } else if (parsingMilestones && trimmed.startsWith("M")) {
            const milestoneRegex = /M(\d+)\s*\[([^\]]+)\]:\s*(.+?)\s*->\s*(.+)/;
            const match = trimmed.match(milestoneRegex);

            // Ensure match exists and has all 5 parts (full match + 4 groups)
            if (match && match.length === 5) {
                const sequence = match[1] as string;
                const status = match[2] as string;
                const title = match[3] as string;
                const description = match[4] as string;

                plan.milestones.push({
                    sequenceNumber: parseInt(sequence, 10),
                    title: title.trim(),
                    description: description.trim(),
                    completed: status.trim().toUpperCase() === "DONE",
                });
            }
        }
    }

    return plan;
}

function formatPlanContext(plan: LearningPlanContext): string {
    let context = "=== LEARNING PLAN CONTEXT ===\n";
    context += `Project: ${plan.projectName}\n`;
    context += `Description: ${plan.projectDescription}\n`;
    context += `Duration: ${plan.durationDays} days\n`;
    context += `Skill Level: ${plan.skillLevel}\n\n`;

    context += "Milestones:\n";
    for (const milestone of plan.milestones) {
        const status = milestone.completed
            ? "✅ DONE"
            : "⏳ PENDING";

        context += `M${milestone.sequenceNumber} [${status}]: ${milestone.title}\n`;
        context += `  → ${milestone.description}\n`;
    }

    return context;
}

function getCurrentMilestone(
    plan: LearningPlanContext
): Milestone | null {
    return plan.milestones.find((m) => !m.completed) || null;
}

function generateSocraticPrompt(
    plan: LearningPlanContext,
    milestone: Milestone | null
): string {
    let prompt = `You are a Socratic tutor helping a developer learn through guided questioning and discovery.\n\n`;

    prompt += formatPlanContext(plan) + "\n";

    if (milestone) {
        prompt += `Current Milestone: M${milestone.sequenceNumber} - ${milestone.title}\n`;
        prompt += `Description: ${milestone.description}\n\n`;
        prompt += `GUIDANCE APPROACH:\n`;
        prompt += `1. Ask clarifying questions\n`;
        prompt += `2. Guide discovery through questions\n`;
        prompt += `3. Provide hints, not solutions\n`;
        prompt += `4. Celebrate progress\n`;
        prompt += `5. Connect work to objectives\n`;
    } else {
        prompt += `All milestones have been completed! 🎉\n`;
    }

    return prompt;
}

/* -------------------------------------------------------
   EXPRESS + MCP TRANSPORT LAYER
------------------------------------------------------- */

const app = express();
app.use(express.json());

const transports: Record<
    string,
    StreamableHTTPServerTransport
> = {};

function createTransport() {
    const eventStore = new InMemoryEventStore();

    return new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        enableJsonResponse: true,
        eventStore,
        onsessioninitialized: (sessionId) => {
            console.log(`✅ New MCP session initialized: ${sessionId}`);
        },
    });
}

app.post("/mcp/:planId", async (req, res) => {
    try {
        const { planId } = req.params;
        const sessionId = req.headers[
            "mcp-session-id"
        ] as string | undefined;

        if (!sessionId && isInitializeRequest(req.body)) {
            console.log("🔹 New initialize request");

            const transport = createTransport();
            const server = createServer(planId); 

            transport.onclose = () => {
                const sid = transport.sessionId;
                if (sid && transports[sid]) {
                    delete transports[sid];
                    console.log(`❌ Session closed: ${sid}`);
                }
            };

            await server.connect(transport as any);
            await transport.handleRequest(req, res, req.body);

            const sid = transport.sessionId;
            if (sid) {
                transports[sid] = transport;
            }

            return;
        }

        if (sessionId && transports[sessionId]) {
            console.log(
                `➡️ Handling request for session ${sessionId}`
            );

            const transport = transports[sessionId];
            await transport.handleRequest(req, res, req.body);
            return;
        }

        res.status(400).json({
            jsonrpc: "2.0",
            error: {
                code: -32000,
                message: "Bad Request: Missing or invalid MCP session ID",
            },
            id: null,
        });
    } catch (err) {
        console.error("MCP POST error:", err);
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: "2.0",
                error: {
                    code: -32603,
                    message: "Internal server error",
                },
                id: null,
            });
        }
    }
});

app.get("/mcp/:planId", async (req, res) => {
    const sessionId = req.headers[
        "mcp-session-id"
    ] as string | undefined;

    if (!sessionId || !transports[sessionId]) {
        res.status(400).send("Invalid or missing MCP session ID");
        return;
    }

    console.log(`🔁 Opening SSE stream for session ${sessionId}`);

    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
});

app.delete("/mcp/:planId", async (req, res) => {
    const sessionId = req.headers[
        "mcp-session-id"
    ] as string | undefined;

    if (!sessionId || !transports[sessionId]) {
        res.status(400).send("Invalid or missing session ID");
        return;
    }

    console.log(`🛑 Closing session ${sessionId}`);

    const transport = transports[sessionId];
    await transport.handleRequest(req, res);

    await transport.close();
    delete transports[sessionId];
});

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        server: "buildspace-mcp",
        version: "1.0.0",
    });
});

const expressServer = app.listen(port, () => {
    console.log(
        `✅ Buildspace MCP running on http://localhost:${port}/mcp`
    );
    console.log(`📚 Backend URL: ${BACKEND_URL}`);
    console.log(`🏥 Health check: http://localhost:${port}/health`);
});

process.on("SIGINT", async () => {
    console.log("\n🛑 Shutting down MCP server...");

    for (const sid in transports) {
        await transports[sid]?.close();
        delete transports[sid];
    }

    await expressServer.close();
    process.exit(0);
});
