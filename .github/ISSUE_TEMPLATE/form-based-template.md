---
name: Form based template
about: Issue template to create issue using form
title: ''
labels: ''
assignees: ''

---

---
name: Issue-Form
about: This template is advanced form for creating issue.
title: ''
labels: ''
assignees: ''

---

name: BOC Ticket Form
description: Create a new Ticket for BOC Community
title: "[BOC Community]: "
labels: ["BOC Community"]
body:
  - type: textarea
    id: ticket-description
    validations:
      required: true
    attributes:
      label: Ticket Contents
      value: |
        ## Description
        [Provide a brief description of the feature, including why it is needed and what it will accomplish.]

  - type: textarea
    id: ticket-goals
    validations:
      required: true
    attributes:
      label: Goals
      description: List the goals of the feature.
      value: |
        ## Goals
        - [ ] [Goal 1]
        - [ ] [Goal 2]
        - [ ] [Goal 3]
        - [ ] [Goal 4]
        - [ ] [Goal 5]

  - type: textarea
    id: ticket-expected-outcome
    attributes:
      label: Expected Outcome
      description: Describe in detail what the final product or result should look like and how it should behave.

  - type: textarea
    id: ticket-acceptance-criteria
    attributes:
      label: Acceptance Criteria
      description: List the acceptance criteria for this feature.

  - type: textarea
    id: ticket-implementation-details
    validations:
      required: true
    attributes:
      label: Implementation Details
      description: List any technical details about the proposed implementation, including any specific technologies that will be used.

  - type: textarea
    id: ticket-mockups
    attributes:
      label: Mockups/Wireframes
      description: Include links to any visual aids, mockups, wireframes, or diagrams that help illustrate what the final product should look like. This is not always necessary, but can be very helpful in many cases.

  - type: input
    id: ticket-product
    attributes:
      label: Product Name
      placeholder: Enter Product Name
    validations:
      required: true

  - type: dropdown
    id: ticket-organisation
    attributes:
      label: Organisation Name
      description: Enter Organisation Name
      multiple: false
      options:
        - BECKN Foundation
        
    validations:
      required: true

  - type: input
    id: ticket-governance-domain
    attributes:
      label: Domain
      placeholder: Enter Area of Governance

  - type: dropdown
    id: ticket-technical-skills-required
    attributes:
      label: Tech Skills Needed
      description: Select the technologies needed for this ticket (use Ctrl or Command to select multiple)
      multiple: true
      options:
        - .NET
        - Agile
        - Angular
        - Artificial Intelligence
        - ASP.NET
        - AWS
        - Babel
        - Bootstrap
        - C#
        - Chart.js
        - CI/CD
        - Computer Vision
        - CORS
        - cURL
        - Cypress
        - D3.js
        - Database
        - Debugging
        - Design
        - DevOps
        - Django
        - Docker
        - Electron
        - ESLint
        - Express.js
        - Feature
        - Flask
        - Go
        - GraphQL
        - HTML
        - Ionic
        - Jest
        - Java
        - JavaScript
        - Jenkins
        - JWT
        - Kubernetes
        - Laravel
        - Machine Learning
        - Maintenance
        - Markdown
        - Material-UI
        - Microservices
        - MongoDB
        - Mobile
        - Mockups
        - Mocha
        - Natural Language Processing
        - NestJS
        - Node.js
        - NUnit
        - OAuth
        - Performance Improvement
        - Prettier
        - Python
        - Question
        - React
        - React Native
        - Redux
        - RESTful APIs
        - Ruby
        - Ruby on Rails
        - Rust
        - Scala
        - Security
        - Selenium
        - SEO
        - Serverless
        - Solidity
        - Spring Boot
        - SQL
        - Swagger
        - Tailwind CSS
        - Test
        - Testing Library
        - Three.js
        - TypeScript
        - UI/UX/Design
        - Virtual Reality
        - Vue.js
        - WebSockets
        - Webpack
        - Other
    validations:
      required: true



  - type: dropdown
    id: ticket-complexity
    attributes: 
      label: Complexity
      description: Choose a complexity describing the complexity of your ticket
      multiple: false
      options:
        - Beginner
        - Low
        - Medium
        - High
    validations:
      required: true

  - type: dropdown
    id: ticket-category
    attributes: 
      label: Category
      description: Choose the categories that best describe your ticket
      multiple: true
      options:
        - API
        - Analytics
        - Accessibility
        - Backend
        - Breaking Change
        - Beginner Friendly
        - Configuration
        - CI/CD
        - Database
        - Data Science
        - Deprecation
        - Documentation
        - Delpoyment
        - Frontend
        - Internationalization
        - Localization
        - Machine Learning
        - Maintenance
        - Mobile
        - Performance Improvement
        - Question
        - Refactoring
        - Research
        - Needs Reproduction
        - SEO
        - Security
        - Testing
        - Other
    validations:
      required: true