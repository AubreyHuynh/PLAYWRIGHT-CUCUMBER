@api @ui @regression
Feature: Integrated UI + API Tests

  Scenario: Create account via API then login via UI
    Given a new user account exists via API
    Then I should be able to login via UI with the API-created account

  Scenario: Register via UI then verify via API
    When I register a new account
    Then I should be logged in successfully
