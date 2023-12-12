/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
Cypress.Commands.add("login", ({ email, password }) => {
  cy.log("Logging in to Google");
  cy.visit("/").wait(1000);
  cy.get("button").click().wait(2000);
  cy.origin(
    "https://accounts.google.com/",
    { args: { email, password } },
    ({ email, password }) => {
      Cypress.on(
        "uncaught:exception",
        (err) =>
          !err.message.includes("ResizeObserver loop") &&
          !err.message.includes("Error in protected function"),
      );
      cy.get('input[type="email"]')
        .should("be.visible")
        .type(email, { log: false });
      cy.get('input[type="email"]').should("contain.value", email);
      cy.contains("Next").click().wait(2000);
      cy.get('[type="password"]').type(password, {
        log: false,
      });
      cy.contains("Next").click().wait(4000);
    },
  );
  cy.contains("Sign in with Google").click().wait(1000);
});
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
declare namespace Cypress {
  interface Chainable {
    login({
      email,
      password,
    }: {
      email: string;
      password: string;
    }): Chainable<void>;
  }
}
