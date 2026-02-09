# Deployment Checklist

## Pre-Deployment

### Backend Configuration
- [ ] Ensure backend is running on port 8080
- [ ] Database is configured and running
- [ ] GEMINI_API_KEY environment variable is set
- [ ] CORS is configured to allow frontend origin

### Frontend Configuration
- [ ] Update `axiosClient.js` baseURL for production
- [ ] Verify all environment variables
- [ ] Test all API endpoints locally

## Testing

### Authentication Flow
- [ ] User can register successfully
- [ ] User can login successfully
- [ ] Token is stored in localStorage
- [ ] Token is sent with API requests
- [ ] User is redirected on 401 errors
- [ ] Logout clears token and redirects

### Learning Plan Flow
- [ ] User can create a learning plan
- [ ] Plan data is displayed on dashboard
- [ ] Milestones are populated correctly
- [ ] Repository URL is saved

### Chat Flow
- [ ] User can send messages
- [ ] AI responses are displayed
- [ ] Loading states work correctly
- [ ] Errors are handled gracefully

### Milestone Verification
- [ ] User can verify milestones
- [ ] AI feedback is displayed
- [ ] Milestone status updates
- [ ] Repository URL is used correctly

## Production Configuration

### Backend
```properties
# Update application.properties
spring.datasource.url=jdbc:mysql://production-host:3306/codementor_db
spring.datasource.username=prod_user
spring.datasource.password=secure_password
```

### Frontend
```javascript
// Update axiosClient.js
baseURL: 'https://api.yourapp.com/api'
```

### CORS Configuration
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("https://yourapp.com")
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Secure JWT secret key
- [ ] Set appropriate token expiration
- [ ] Implement rate limiting
- [ ] Validate all user inputs
- [ ] Sanitize error messages
- [ ] Enable CORS only for trusted origins

## Performance Optimization

- [ ] Enable gzip compression
- [ ] Optimize bundle size
- [ ] Implement lazy loading
- [ ] Add loading skeletons
- [ ] Cache API responses where appropriate
- [ ] Optimize images and assets

## Monitoring

- [ ] Set up error tracking (Sentry, etc.)
- [ ] Monitor API response times
- [ ] Track user authentication failures
- [ ] Log API errors
- [ ] Set up health checks

## Post-Deployment

- [ ] Test all features in production
- [ ] Verify SSL certificates
- [ ] Check API rate limits
- [ ] Monitor error logs
- [ ] Test on different devices/browsers
- [ ] Verify database connections
- [ ] Test backup and recovery

## Rollback Plan

- [ ] Document current version
- [ ] Keep previous version accessible
- [ ] Have database backup ready
- [ ] Document rollback steps
- [ ] Test rollback procedure

## Support

- [ ] Document known issues
- [ ] Create user guide
- [ ] Set up support channels
- [ ] Monitor user feedback
