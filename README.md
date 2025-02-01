# Système de Réservation de places d'Opéra

## Spécification

Le programme a pour but de trouver des places d'Opéra correspondant à la demande d'un client et de les réserver.

Il peut spécifier :
- Le nombre de places désirées (entre 1 et 5)
- Il y a 3 catégories de place
  - `Orchestra` : les meilleures places, face à l'orchestre
  - `Parterre` : les places en bas de la salle
  - `Balcony` : les places en haut de la salle. Elle est composée d'un parterre et de loges
- S'il choisit `Balcony`, il peut spécifier s'il désire une loge ou non
- Si le client choisit la catégorie `Orchestra` ou `Parterre`, il peut spécifier une préférence entre l'avant et l'arrière de la salle

Voici les contraintes :
- S'il choisit `Balcony`, une loge ne peut être assignée que si le nombre de place n'excède pas 3
- Les 3 premières rangées de la catégorie `Parterre` sont indisponible entre le 21 Juin et le 21 Septembre car elles sont réservées à des programmes 
de financement de la culture chez les jeunes. Notre système de réservation est utilisé par des adultes qui
ne sont pas concernés par ces programmes, donc les sièges apparaitront comme "disponibles" mais ne le seront en réalité pas.
- Dans le cas de `Balcony`, Il doit toujours y avoir au moins 4 loges disponibles pour les VIP

## Fonctionnement

Le client demande à réserver une place en fournissant les informations nécessaires.
L'algorithme se charge ensuite de trouver les places correspondantes.
Si des places ont été trouvé, un ticket est imprimé.
Sinon, un message d'erreur est affiché.