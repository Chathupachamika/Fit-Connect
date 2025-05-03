package com.example.OOP_FitConnect.controller;

import com.example.OOP_FitConnect.model.User;
import com.example.OOP_FitConnect.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    @GetMapping("/dashboard")
    public String adminDashboard(HttpServletRequest request, Model model) {
        String userId = (String) request.getSession().getAttribute("userId");
        User admin = userService.getUserById(userId);

        if (admin != null && admin.isAdmin()) {
            List<User> users = userService.getAllUsers();
            model.addAttribute("admin", admin);
            model.addAttribute("users", users);
            return "admin/dashboard";
        }

        return "redirect:/dashboard";
    }

    @PostMapping("/api/delete-user/{userId}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteUser(
            @PathVariable String userId,
            HttpServletRequest request) {

        Map<String, Object> response = new HashMap<>();

        String adminId = (String) request.getSession().getAttribute("userId");
        User admin = userService.getUserById(adminId);

        if (admin != null && admin.isAdmin()) {
            User userToDelete = userService.getUserById(userId);

            if (userToDelete != null && !userToDelete.isAdmin()) {
                userService.deleteUser(userId);

                response.put("success", true);
                response.put("message", "User deleted successfully");
                return ResponseEntity.ok(response);
            }

            response.put("success", false);
            response.put("message", "User not found or cannot delete admin");
            return ResponseEntity.badRequest().body(response);
        }

        response.put("success", false);
        response.put("message", "Unauthorized access");
        return ResponseEntity.badRequest().body(response);
    }
}