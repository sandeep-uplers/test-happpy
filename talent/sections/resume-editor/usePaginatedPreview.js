import { useEffect, useRef, useState } from "react";

const PAGE_HEIGHT = 1056;

export function usePaginatedPreview(dependencies = [], topBottomMargin) {
    const sourceRef = useRef(null);
    const workspaceRef = useRef(null);
    const [pages, setPages] = useState([]);
    const BUFFER = 2 * topBottomMargin + 28;

    useEffect(() => {
        if (!sourceRef.current || !workspaceRef.current) return;

        const workspace = workspaceRef.current;
        workspace.innerHTML = "";

        const originalPage = sourceRef.current.childNodes[0];
        if (!originalPage) return;

        const baseClass = originalPage.className || "";
        const header = originalPage.querySelector(".template-header");
        const wrappers = [...originalPage.querySelectorAll(".section-wrapper")];

        let page = createPage(baseClass);
        workspace.appendChild(page);

        if (header) {
            page.appendChild(header.cloneNode(true));
        }

        let currentItemsContainer = null;
        let currentSection = null;
        let currentItemsTemplate = null;
        let currentWrapperTemplate = null;
        let currentTitleTemplate = null;
        let titleAlreadyRendered = false;
        let currentSectionHeaderTemplate = null;

        wrappers.forEach((wrapper) => {
            const section = wrapper.querySelector(".section");
            if (!section) return;

            const title = section.querySelector(".section-title");
            const sectionHeader = section.querySelector(".section-header-professional-template");
            const itemsContainer = section.querySelector(".section-items");
            currentTitleTemplate = title; // store reference

            if (!itemsContainer) {
                appendAtomic(wrapper.cloneNode(true));
                return;
            }

            currentSection = section;
            currentItemsTemplate = itemsContainer;
            currentWrapperTemplate = wrapper;
            currentSectionHeaderTemplate = sectionHeader || title || null;

            const wrapperClone = wrapper.cloneNode(false);
            const sectionClone = section.cloneNode(false);
            const itemsClone = itemsContainer.cloneNode(false);
            
            wrapperClone.appendChild(sectionClone);

            if (sectionHeader) {
                sectionClone.appendChild(sectionHeader.cloneNode(true));
                titleAlreadyRendered = true;
            } else if (title) {
                sectionClone.appendChild(title.cloneNode(true));
                titleAlreadyRendered = true;
            }
            sectionClone.appendChild(itemsClone);
            
            // 🧠 Only append after full structure is ready
            page.appendChild(wrapperClone);
            
            // Check if title alone overflows
            if (getPageHeight() + BUFFER > PAGE_HEIGHT) {
                page.removeChild(wrapperClone);
                page = createPage(baseClass);
                workspace.appendChild(page);
                page.appendChild(wrapperClone);
            }
            
            currentItemsContainer = itemsClone;

            const items = [...itemsContainer.children];

            items.forEach((item) => {
                const bulletList = item.querySelector(
                    "ul.exp-description, ul.project-points"
                );

                if (!bulletList) {
                    appendAtomicItem(item);
                } else {
                    paginateBulletItem(item, bulletList);
                }
            });
        });

        setPages(
            [...workspace.querySelectorAll(".resume-page")].map(
                (p) => p.outerHTML
            )
        );

        /* ---------------- helpers ---------------- */

        function getPageHeight() {
            let h = 0;
            page.childNodes.forEach((n) => (h += n.offsetHeight));
            return h;
        }

        function newPageWithSection() {
            page = createPage(baseClass);
            workspace.appendChild(page);

            if (header && workspace.childNodes.length === 1) {
                page.appendChild(header.cloneNode(true));
            }

            const w = currentWrapperTemplate.cloneNode(false);
            const s = currentSection.cloneNode(false);
            const i = currentItemsTemplate.cloneNode(false);

            // 🔥 Add title again on new page
            if (currentTitleTemplate && !titleAlreadyRendered) {
                s.appendChild(currentTitleTemplate.cloneNode(true));
                titleAlreadyRendered = true;
            }

            // if (currentSectionHeaderTemplate) {
            //     s.appendChild(currentSectionHeaderTemplate.cloneNode(true));
            // }
            s.appendChild(i);
            w.appendChild(s);
            page.appendChild(w);

            currentItemsContainer = i;
        }

        function appendAtomic(node) {
            page.appendChild(node);
            if (getPageHeight() + BUFFER > PAGE_HEIGHT) {
                page.removeChild(node);
                page = createPage(baseClass);
                workspace.appendChild(page);
                if (header && workspace.childNodes.length === 1) {
                    page.appendChild(header.cloneNode(true));
                }
                page.appendChild(node);
            }
        }

        function appendAtomicItem(item) {
            const clone = item.cloneNode(true);
            currentItemsContainer.appendChild(clone);

            if (getPageHeight() + BUFFER > PAGE_HEIGHT) {
                currentItemsContainer.removeChild(clone);
                newPageWithSection();
                currentItemsContainer.appendChild(clone);
            }
        }

        function paginateBulletItem(item, bulletList) {
            const headerBlock = item.querySelector(".exp-info, .project-title, .prj-info-top");
            const bullets = [...bulletList.children];

            if (!bullets.length) return;

            /* ---- RULE: header + FIRST bullet must fit ---- */

            const testShell = item.cloneNode(false);
            if (headerBlock) testShell.appendChild(headerBlock.cloneNode(true));

            const testList = bulletList.cloneNode(false);
            testList.appendChild(bullets[0].cloneNode(true));
            testShell.appendChild(testList);

            currentItemsContainer.appendChild(testShell);

            if (getPageHeight() + BUFFER > PAGE_HEIGHT) {
                currentItemsContainer.removeChild(testShell);
                newPageWithSection();
            } else {
                currentItemsContainer.removeChild(testShell);
            }

            /* ---- Now render for real ---- */

            let shell = item.cloneNode(false);
            if (headerBlock) shell.appendChild(headerBlock.cloneNode(true));

            let listClone = bulletList.cloneNode(false);
            shell.appendChild(listClone);
            currentItemsContainer.appendChild(shell);

            bullets.forEach((bullet, index) => {
                const bulletClone = bullet.cloneNode(true);
                listClone.appendChild(bulletClone);

                if (getPageHeight() + BUFFER > PAGE_HEIGHT) {
                    listClone.removeChild(bulletClone);
                    newPageWithSection();

                    shell = item.cloneNode(false);
                    listClone = bulletList.cloneNode(false);
                    shell.appendChild(listClone);
                    currentItemsContainer.appendChild(shell);

                    listClone.appendChild(bulletClone);
                }
            });

            const tech = item.querySelector(".exp-tech-skills");
            if (tech) {
                const techClone = tech.cloneNode(true);
                shell.appendChild(techClone);

                if (getPageHeight() + BUFFER > PAGE_HEIGHT) {
                    shell.removeChild(techClone);
                    newPageWithSection();
                    shell.appendChild(techClone);
                }
            }
        }
    }, [...dependencies]);

    return { sourceRef, workspaceRef, pages };
}

function createPage(baseClass) {
    const p = document.createElement("div");
    p.className = `${baseClass} resume-page`;
    return p;
}