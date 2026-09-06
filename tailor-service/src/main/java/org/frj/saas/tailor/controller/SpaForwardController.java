package org.frj.saas.tailor.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardController {

    @GetMapping(value = {
            "/login",
            "/signup",
            "/forgot-password",
            "/dashboard",
            "/billing",
            "/billing/**",
            "/measurements",
            "/measurements/**",
            "/clothing-types",
            "/clothing-types/**"
    })
    public String forwardSpa() {
        return "forward:/index.html";
    }
}
