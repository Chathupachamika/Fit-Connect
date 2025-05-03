package com.example.OOP_FitConnect.controller;

import com.example.OOP_FitConnect.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
public class BMICalculatorController {

    @Autowired
    private UserService userService;

    @GetMapping("/bmi")
    public String bmiCalculatorPage(HttpServletRequest request, Model model) {
        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("userId") != null) {
            String userId = (String) session.getAttribute("userId");
            model.addAttribute("user", userService.getUserById(userId));
            return "bmi";
        }
        return "redirect:/login";
    }

    @PostMapping("/api/calculate-bmi")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> calculateBMI(
            @RequestParam double weight,
            @RequestParam double height,
            @RequestParam(required = false) String gender,
            HttpServletRequest request) {

        Map<String, Object> response = new HashMap<>();

        // Convert height from cm to meters
        double heightInMeters = height / 100;

        // Calculate BMI
        double bmi = weight / (heightInMeters * heightInMeters);

        // Round to 1 decimal place
        bmi = Math.round(bmi * 10.0) / 10.0;

        // Determine BMI category
        String category;
        if (bmi < 18.5) {
            category = "Underweight";
        } else if (bmi < 25) {
            category = "Normal weight";
        } else if (bmi < 30) {
            category = "Overweight";
        } else {
            category = "Obese";
        }

        // Gender-specific recommendations
        String recommendation;
        if (gender != null && gender.equalsIgnoreCase("female")) {
            if (bmi < 18.5) {
                recommendation = "Focus on nutrient-dense foods to gain weight in a healthy way.";
            } else if (bmi < 25) {
                recommendation = "Maintain your healthy weight with a balanced diet and regular exercise.";
            } else {
                recommendation = "Aim for a moderate calorie deficit through healthy eating and increased physical activity.";
            }
        } else {
            if (bmi < 18.5) {
                recommendation = "Increase caloric intake and consider strength training to build muscle mass.";
            } else if (bmi < 25) {
                recommendation = "Maintain your healthy weight with a balanced diet and regular exercise.";
            } else {
                recommendation = "Focus on reducing caloric intake and incorporating both cardio and strength training.";
            }
        }

        // Store BMI result in user profile if logged in
        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("userId") != null) {
            String userId = (String) session.getAttribute("userId");
            userService.updateUserBmi(userId, bmi);
        }

        response.put("bmi", bmi);
        response.put("category", category);
        response.put("recommendation", recommendation);

        return ResponseEntity.ok(response);
    }
}