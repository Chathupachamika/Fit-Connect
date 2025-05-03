package com.example.OOP_FitConnect.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;

/**
 * Filter to secure protected endpoints requiring authentication
 */
public class AuthFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        HttpSession session = httpRequest.getSession(false);
        boolean isLoggedIn = session != null && session.getAttribute("userId") != null;

        // Handle AJAX requests differently to avoid CORS issues
        boolean isAjax = "XMLHttpRequest".equals(httpRequest.getHeader("X-Requested-With"));

        if (isLoggedIn) {
            // User is authenticated, proceed with the request
            chain.doFilter(request, response);
        } else {
            // User is not authenticated
            if (isAjax) {
                // For AJAX requests, return 401 Unauthorized status with JSON
                httpResponse.setContentType("application/json");
                httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                httpResponse.getWriter().write("{\"error\":\"Not authenticated\",\"redirect\":\"/login\"}");
            } else {
                // For regular requests, redirect to login page
                httpResponse.sendRedirect(httpRequest.getContextPath() + "/login");
            }
        }
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // Initialization if needed
    }

    @Override
    public void destroy() {
        // Cleanup if needed
    }
}