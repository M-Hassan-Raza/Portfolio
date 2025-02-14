# Portfolio Website

This repository contains the source code for my personal portfolio website. The website is built using Hugo and the PaperMod theme.

## Table of Contents

- Installation
- Usage
- Configuration
- Features
- Contributing
- License

## Installation

To set up the project locally, follow these steps:

1. **Clone the repository:**

    ```sh
    git clone https://github.com/m-hassan-raza/Portfolio.git
    cd Portfolio
    ```

2. **Install Hugo:**

    Follow the [Hugo installation guide](https://gohugo.io/getting-started/installing/) to install Hugo on your machine.

3. **Run the development server:**

    ```sh
    hugo server
    ```

    The website should now be accessible at `http://localhost:1313`.

## Usage

### Building the Site

To build the site for production, run:

```sh
hugo
```

The generated static files will be located in the public directory.

### Deployment

You can deploy the site to any static hosting service. For example, to deploy to GitHub Pages, follow the [Hugo GitHub Pages deployment guide](https://gohugo.io/hosting-and-deployment/hosting-on-github/).

## Configuration

The main configuration file for the site is hugo.yaml. Here are some key configuration options:

- **Site Metadata:**

    ```yaml
    baseURL: "https://mhassan.dev/"
    title: "Muhammad Hassan Raza"
    theme: "PaperMod"
    defaultContentLanguage: "en"
    languageCode: "en-us"
    ```

- **Author Information:**

    ```yaml
    params:
      author: "Muhammad Hassan Raza"
      ShowShareButtons: true
      ShowPostNavLinks: true
    ```

- **Menu Configuration:**

    ```yaml
    menu:
      main:
        - identifier: "search"
          name: "Search"
          url: "/search/"
          weight: 5
        - identifier: "about"
          name: "About"
          url: "/about/"
          weight: 1
        - identifier: "projects"
          name: "Projects"
          url: "/projects/"
          weight: 2
        - identifier: "blog"
          name: "Blog"
          url: "/blog/"
          weight: 3
    ```

- **Security Settings:**

    ```yaml
    security:
      funcs:
        getenv:
          - ^UMAMI_BEACON_TOKEN$
      http:
        methods:
          - ^GET$
          - ^POST$
        csp:
          default-src: "'self' https: 'unsafe-inline'"
    ```

## Features

- **Responsive Design:** The site is fully responsive and works on all devices.
- **SEO Friendly:** The site is optimized for search engines.
- **Dark/Light Theme:** Automatic theme switch based on browser settings.
- **Search Functionality:** Powered by Fuse.js for fast and accurate search results.
- **Social Media Integration:** Links to GitHub, LinkedIn, and email.
- **Code Block Copy Buttons:** Easily copy code snippets with a single click.
- **Breadcrumb Navigation:** Navigate through the site with ease.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add new feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

For more details, visit the [PaperMod Wiki](https://github.com/adityatelange/hugo-PaperMod/wiki).
