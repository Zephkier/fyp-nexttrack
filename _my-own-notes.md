# Initialise A Next.js Project

In terminal, run the following:

```
npx create-next-app@latest .
```

-   "`@latest`" refers to the latest version of Next.js.
-   "`.`" refers to the current directory where the project will be created in.

*   Choose the default options when prompted.
    -   All `Yes`, except for, "Would you like to customize the import alias (`@/*` by default)?"
*   Git should be auto-initialised and committed.

To develop project/app/website:

```
npm run dev
```

# My Own Notes

-   All files in this directory were auto-generated and can be left alone.
    -   Advanced Next.js users (or when using images from URLs i.e. `<Image>`) may choose to edit `config` files.
    -   Only concern yourself with `public/` and `src/`.

*   Must (and is better to) specify param's type, else, may simply use `any`, like...
    -   `myStats: any`
    -   `myStats: { height: any; weight: any }`
    -   `{ mustBeSameName }: { mustBeSameName: any }`

# Directories

## `./public/`

-   Contains files that are...

    -   Publicly accessible - even to users by adding `/example.svg` at the end of the URL.
    -   Served directly to the client (e.g. static files like images).

-   If elements inside `.tsx` files needs a `src=` attribute:
    -   Do this: `src="/example.svg"`
    -   And not: `src="../../public/example.svg"`

## `./src/`

-   Contains the website's and its related (e.g. third-party) code.

## `./src/app/`

-   Is the directory for index page (also contains sub-directories for other pages).
-   Must have, and is served via, `page.tsx` in this directory (and not `index.tsx` or `index.html`).

## `./src/app/example/`

-   Is the directory for _example_ page.
-   Must have, and is served via, `page.tsx` in this directory.

## `./src/app/example/[someID]/`

-   Is the directory for _example_ page's **sub-page** (e.g. `.com/example/1`).
-   Must enclose in `[]`, so Next.js knows that its `page.tsx` is the param for `example/[someID]`.

# Files

## `layout.tsx`

-   Sets the website's layout.
    -   This helps one to easily set a common `<navbar>` and `<footer>` across all pages.

*   The `href` in `<Link href={""}>` must match directory names in `app/`!

-   Can also set its route's layout that will not be applied to other routes.
    -   e.g. Having a specific layout only for routes **within** the `users/` directory.

## `not-found.tsx`

-   Sets a **custom** 404 error page.
-   Override the default `notFound()` from `import { notFound } from "next/navigation"`

## Other `.tsx` files

-   Like `not-found.tsx` from earlier, `loading.tsx`, `error.tsx`.

## `*.tsx`

-   Do not include `use client` at beginning of files to use server-side code like...

    -   `await` and `async`
    -   `fetch()`
    -   Getting API data.
    -   Other server-side interactions, and more.

-   Include `"use client";` at beginning of files to use client-side code like...
    -   `useState()`
    -   `alert()`
    -   Other client-side interactions, and more.

# Next.js' Components/Elements

-   Next's `<Image>` > HTML's `<img>`: Next's has optimisation features.
    -   Auto-serves the appropriate image sizes for different devices.
    -   Uses _lazy loading_ which improves/shortens load time.
        -   Must edit [`next.config.ts`](./next.config.ts).
        -   See [YouTube video](https://youtu.be/6jQdZcYY8OY?si=KcePyDes-wMriONM&t=1634) @ `27:14`.
    -   And more.
