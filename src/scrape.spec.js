/// <reference types="cypress" />

describe("Scrape School fill rate", () => {
  const results = {}
  it("passes", () => {
    cy.visit("https://inscription.cfwb.be/nc/outils/recherche-dune-ecole-secondaire/")
    Cypress.on("uncaught:exception", () => {
      // prevents Cypress from failing the test
      return false
    })
    cy.get("#titreAdresseSecondaireRech").type("*")
    cy.get('[name="rechercherEcoleSec"]').click()

    cy.get("#resu_array a").then(links => {
      cy.log("Links", links.length)
      links.each((_, link) => {
        const schoolId = `${link.parentElement.previousElementSibling.previousElementSibling.innerText}/${link.parentElement.previousElementSibling.innerText}`
        cy.log(schoolId)
        console.log(schoolId)
        cy.visit(link.href)
        results[schoolId] = {}
        cy.get("body").then($body => {
          if ($body.find("#situation_array img").length > 0) {
            cy.get("#situation_array img").then(images => {
              cy.log(images.length)
              images.each((index, image) => {
                results[schoolId][index] = image.src
                cy.log(image.src)
                cy.writeFile("data/fill.json", results)
              })
            })
          }
        })
      })
    })
  })
  it("save", () => {
    cy.log("results", results)

    cy.writeFile("data/fill.json", results)
  })
})
