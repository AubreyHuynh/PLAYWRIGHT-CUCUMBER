@ui @smoke
Feature: User Authentication

  Background:
    Given I am on the login page

  @regression
  Scenario: Register a new user account
    When I register a new account
    Then I should be logged in successfully
    And I should see "Logged in as" in the header

  @smoke
  Scenario: Login with valid credentials
    Given I am logged in as a new user
    When I logout
    And I am on the login page
    When I login with the registered credentials
    Then I should be logged in successfully

  @regression
  Scenario: Logout after login
    Given I am logged in as a new user
    When I logout
    Then I should be logged out
