package org.frj.saas.tailor.dto;

public class CustomerSuggestionDto {
    private String mobile;
    private String name;

    public CustomerSuggestionDto() {}

    public CustomerSuggestionDto(String mobile, String name) {
        this.mobile = mobile;
        this.name = name;
    }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
