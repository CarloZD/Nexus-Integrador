package com.nexus.marketplace.util;


import java.util.regex.Pattern;

public class PasswordValidator {

    private static final int MIN_LENGTH = 8;
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile("[a-z]");
    private static final Pattern DIGIT_PATTERN = Pattern.compile("\\d");
    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile("[!@#$%^&*(),.?\":{}|<>]");

    public static ValidationResult validate(String password) {
        ValidationResult result = new ValidationResult();

        if (password == null || password.length() < MIN_LENGTH) {
            result.addError("La contraseña debe tener al menos " + MIN_LENGTH + " caracteres");
        }

        if (!UPPERCASE_PATTERN.matcher(password).find()) {
            result.addError("La contraseña debe contener al menos una letra mayúscula");
        }

        if (!LOWERCASE_PATTERN.matcher(password).find()) {
            result.addError("La contraseña debe contener al menos una letra minúscula");
        }

        if (!DIGIT_PATTERN.matcher(password).find()) {
            result.addError("La contraseña debe contener al menos un número");
        }

        if (!SPECIAL_CHAR_PATTERN.matcher(password).find()) {
            result.addError("La contraseña debe contener al menos un carácter especial");
        }

        return result;
    }

    public static class ValidationResult {
        private final java.util.List<String> errors = new java.util.ArrayList<>();

        public void addError(String error) {
            errors.add(error);
        }

        public boolean isValid() {
            return errors.isEmpty();
        }

        public java.util.List<String> getErrors() {
            return errors;
        }

        public String getErrorMessage() {
            return String.join(". ", errors);
        }
    }
}