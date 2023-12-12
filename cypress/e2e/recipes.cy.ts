describe("User story", () => {
  before(() => {
    const email = Cypress.env("user").email;
    expect(email).to.not.be.undefined;
    const password = Cypress.env("user").password;
    expect(password).to.not.be.undefined;
    cy.login({ email, password });
    cy.get("ul").contains("Här var det tomt.");
  });
  it("can create a new recipe", () => {
    cy.get('[data-cy="recipes"]').first().click().wait(1000);
    cy.get('[data-cy="create-empty-recipe-link"]');
  });
});
