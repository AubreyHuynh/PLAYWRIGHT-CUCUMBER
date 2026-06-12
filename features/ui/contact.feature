@ui @smoke
Feature: Contact Us Form with File Upload

  Scenario: Submit contact form with file attachment
    Given I am on the contact page
    When I fill the contact form with valid data
    And I upload "sample.txt" as attachment
    And I submit the contact form
    Then I should see a contact success message
