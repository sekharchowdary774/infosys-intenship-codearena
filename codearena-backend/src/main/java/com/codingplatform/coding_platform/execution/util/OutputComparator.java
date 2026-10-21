package com.codingplatform.coding_platform.execution.util;

public class OutputComparator {

    private OutputComparator() {
    }

    public static boolean isEqual(
            String actualOutput,
            String expectedOutput) {

        String actual = normalize(actualOutput);

        String expected = normalize(expectedOutput);

        return actual.equals(expected);
    }

    private static String normalize(String value) {

        if (value == null) {
            return "";
        }

        return value
                .trim()
                .replaceAll("\\s+", " ");
    }
}
