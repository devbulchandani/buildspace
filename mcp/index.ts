import express from "express";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { InMemoryEventStore } from "@modelcontextprotocol/sdk/examples/shared/inMemoryEventStore.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";

import { simpleGit, type SimpleGit } from "simple-git";
import fs from "fs-extra";
import path from "path";
import { z } from "zod";

const port = process.env.PORT || 8080;



const server = new McpServer(
    {
        name: "repo-analyzer",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: { listChanged: false },
            logging: {},
        },
    }
);


async function cloneRepo(repoUrl: string): Promise<string> {
    const repoName =
        repoUrl.split("/").pop()?.replace(".git", "") || "repo";
    const repoPath = path.join(
        "/tmp",
        `repo-${Date.now()}-${repoName}`
    );

    if (await fs.pathExists(repoPath)) {
        await fs.remove(repoPath);
    }

    const git: SimpleGit = simpleGit();
    const httpsUrl = repoUrl.replace(/\/$/, "");
    await git.clone(httpsUrl, repoPath);
    console.log("Cloning repo via HTTPS:", httpsUrl);

    return repoPath;
}

async function readTree(dir: string, maxFiles = 5000): Promise<any> {
    let fileCount = 0;

    async function _read(currentDir: string): Promise<any> {
        const entries = await fs.readdir(currentDir, {
            withFileTypes: true,
        });

        const tree: any = {};

        for (const entry of entries) {
            if (
                entry.name === "node_modules" ||
                entry.name.startsWith(".")
            )
                continue;

            fileCount++;
            if (fileCount > maxFiles) {
                return { warning: "Too many files — stopped early" };
            }

            const fullPath = path.join(currentDir, entry.name);

            tree[entry.name] = entry.isDirectory()
                ? await _read(fullPath)
                : "file";
        }

        return tree;
    }

    return _read(dir);
}

async function readFileSafe(filePath: string) {
    const stats = await fs.stat(filePath);

    if (stats.size > 100_000) {
        return "File too large to analyze";
    }

    return fs.readFile(filePath, "utf-8");
}


server.registerTool(
    "analyze_project",
    {
        description: "Analyze the structure of a git repository",
        inputSchema: { repoUrl: z.string() },
    },
    async ({ repoUrl }) => {
        const repoPath = await cloneRepo(repoUrl);
        const tree = await readTree(repoPath);

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(tree, null, 2),
                },
            ],
        };
    }
);

server.registerTool(
    "read_file",
    {
        description: "Read a file from a git repository",
        inputSchema: {
            filePath: z.string(),
            repoUrl: z.string(),
        },
    },
    async ({ repoUrl, filePath }) => {
        const repoPath = await cloneRepo(repoUrl);
        const fullPath = path.join(repoPath, filePath);
        const content = await readFileSafe(fullPath);

        return {
            content: [{ type: "text", text: content }],
        };
    }
);

server.registerTool(
    "read_files",
    {
        description: "Read multiple files from a git repository",
        inputSchema: {
            repoUrl: z.string(),
            filePaths: z.array(z.string()),
        },
    },
    async ({ repoUrl, filePaths }) => {
        const repoPath = await cloneRepo(repoUrl);
        const results: Record<string, string> = {};

        for (const fp of filePaths) {
            const fullPath = path.join(repoPath, fp);
            results[fp] = await readFileSafe(fullPath);
        }

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(results, null, 2),
                },
            ],
        };
    }
);


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


app.post("/mcp", async (req, res) => {
    try {
        const sessionId = req.headers[
            "mcp-session-id"
        ] as string | undefined;

        if (!sessionId && isInitializeRequest(req.body)) {
            console.log("🔹 New initialize request");

            const transport = createTransport();

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
            console.log(`➡️ Handling request for session ${sessionId}`);
            const transport = transports[sessionId];
            await transport.handleRequest(req, res, req.body);
            return;
        }

        res.status(400).json({
            jsonrpc: "2.0",
            error: {
                code: -32000,
                message:
                    "Bad Request: Missing or invalid MCP session ID",
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

app.get("/mcp", async (req, res) => {
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

app.delete("/mcp", async (req, res) => {
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

    // Force cleanup
    await transport.close();
    delete transports[sessionId];
});

app.get("/health", (req, res) => {
    res.send("OK");
});


const expressServer = app.listen(port, () => {
    console.log(`✅ Repo Analyzer MCP running on http://localhost:${port}/mcp`);
});

process.on("SIGINT", async () => {
    console.log("Shutting down MCP server...");

    for (const sid in transports) {
        await transports[sid]?.close();
        delete transports[sid];
    }

    await server.close();
    await expressServer.close();
    process.exit(0);
});
