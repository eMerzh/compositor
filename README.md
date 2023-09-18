# Simulation de l’indice composite

cet outil est une reproduction du simulateur d'indice composite.

il est actuellement en cours de développement et terriblement incomplet, buggé et innefficace... vous serez prévenu

## DATA sources

- https://inscription.cfwb.be/lindice-composite/
- https://www.odwb.be/explore/dataset/signaletique-fase/table/
- https://www.gallilex.cfwb.be/document/pdf/48085_000.pdf
- https://inscription.cfwb.be/fileadmin/sites/insc/uploads/Documents_2023-2024/Liste_ecoles_secondaires.xlsx
- https://inscription.cfwb.be/fileadmin/sites/insc/uploads/Documents_2023-2024/Partenariats_pedagogiques__site.pdf
- https://inscription.cfwb.be/fileadmin/sites/insc/uploads/Documents_2023-2024/Liste_des_ecoles_immersion.xlsx
- BCE

# TODO:

- [ ] Style
- [ ] small footer
- [x] Corriger coefficient 8 (niveau socio) with old data from 2020
- [x] Corriger coefficient 7 (partenariat)
- [x] fix multiple élection
- [x] école nouvelles (=> experluette) maybe??
- [x] Geolocation
- [x] Corriger coefficient 5 (immersion)

# Nice to have:

https://inscription.cfwb.be/les-outils/les-documents/

- [ ] ajouter une indication de remplissage
- [ ] improve immersion (filter school, doc, )
  - [ ] https://inscription.cfwb.be/fileadmin/sites/insc/uploads/Documents_2023-2024/Liste_des_ecoles_immersion.xlsx
- [ ] carte ?
- [ ] exclude techniques?
- [ ] perf
  - [ ] taille du json
  - [ ] efficience du code
- [ ] code cleanup 😱
