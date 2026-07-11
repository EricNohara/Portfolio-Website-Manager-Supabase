"use client";

import {
    AnchorHTMLAttributes,
    PropsWithChildren,
} from "react";

import {
    createDocumentationUrl,
    DocumentationPage,
} from "@/utils/navigation/documentation";

interface DocumentationLinkProps
    extends Omit<
        AnchorHTMLAttributes<HTMLAnchorElement>,
        "href"
    > {
    page: DocumentationPage;
}

export default function DocumentationLink({
    page,
    children,
    ...props
}: PropsWithChildren<DocumentationLinkProps>) {
    const fallbackHref = createDocumentationUrl(page);

    return (
        <a
            href={fallbackHref}
            onClick={(event) => {
                event.preventDefault();

                window.location.assign(
                    createDocumentationUrl(
                        page,
                        window.location.href
                    )
                );
            }}
            {...props}
        >
            {children}
        </a>
    );
}