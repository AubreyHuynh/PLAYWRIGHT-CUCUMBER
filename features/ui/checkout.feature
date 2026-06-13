@ui @regression
Feature: Checkout and Order Placement

  Scenario: Place a complete order
    Given I am logged in as a new user
    And I am on the products page
    When I add "Blue Top" to cart
    And I am on the cart page
    And I proceed to checkout
    And I place an order with payment details
    Then the order should be placed successfully
    And I can download the invoice
