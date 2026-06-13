@api @smoke
Feature: Accounts API

  Scenario: Create a new account via API
    When I create a new account via API
    Then the API response code should be 201
    And the account should be created successfully

  @regression
  Scenario: Verify login via API
    Given a new user account exists via API
    When I verify login via API
    Then the login verification should succeed

  @regression
  Scenario: Delete an account via API
    Given a new user account exists via API
    When I delete the account via API
    Then the API response code should be 200
