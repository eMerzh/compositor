/// <reference types="cypress" />

function parseFillStr(path) {
  const regex = /statutInscr(\d)\.png/
  const extract = regex.exec(path)
  if (extract) {
    return Number.parseInt(extract[1], 10)
  }
}

describe("Scrape School fill rate", () => {
  // const results = {}
  const indexYear = [2020, 2021, 2022, 2023, 2024]
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
        cy.readFile("data/fill.json").then(results => {
          if (!results[schoolId]) {
            results[schoolId] = {}
          }
          cy.get("body").then($body => {
            if ($body.find("#situation_array img").length > 0) {
              cy.get("#situation_array img").then(images => {
                cy.log(images.length)
                images.each((index, image) => {
                  results[schoolId][indexYear[index]] = {
                    fill_number: parseFillStr(image.src),
                  }
                  cy.log(image.src)
                })
              })
              cy.get("#situation_array tr:nth(1) td:not(:first-child)").then(cells => {
                cells.each((index, cell) => {
                  results[schoolId][indexYear[index]].declared = cell.innerText
                })
              })
              cy.get("#situation_array tr:nth(2) td:not(:first-child)").then(cells => {
                cells.each((index, cell) => {
                  results[schoolId][indexYear[index]].received = cell.innerText
                })
              })
              cy.writeFile("data/fill.json", results)
            }
          })
        })
      })
    })
  })
  it("save", () => {})
})
