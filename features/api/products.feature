@api @smoke
Feature: Products API

  Scenario: Get all products list
    When I request the products list via API
    Then the API response code should be 200
    And the products list should not be empty

  @regression
  Scenario Outline: Search product by keyword via API
    When I search for "<keyword>" via API
    Then the API response code should be 200
    And all search results should contain "<keyword>" in the name

    Examples:
      | keyword |
      | top     |
      | dress   |
