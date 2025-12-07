// Function to generate a slug from a heading text (e.g., "Installation Guide" -> "installation-guide")
function generateSlug(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric chars (except space and hyphen)
        .trim()
        .replace(/\s+/g, '-'); // Replace spaces with hyphens
}

// Function to fetch the README content and render it
async function fetchAndRenderReadme() {
    const REPO_OWNER = '76448-ORG';
    const REPO_NAME = 'GPR-Framework';
    const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/readme`;
    
    const contentElement = document.getElementById('readme-content');
    const loadingElement = document.getElementById('loading');
    const tocList = document.getElementById('toc-list');
    const repoTitle = document.getElementById('repo-title'); // Reference the navbar title

    try {
        // 1. Fetch the raw Markdown text
        const response = await fetch(API_URL, {
            headers: {
                'Accept': 'application/vnd.github.v3.raw' 
            }
        });
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.statusText}`);
        }

        const markdownText = await response.text();
        
        // 2. Convert Markdown to HTML
        const renderedHtml = marked.parse(markdownText);
        contentElement.innerHTML = renderedHtml;

        // 3. Apply syntax highlighting
        hljs.highlightAll();

        // 4. Extract and process headings (h2 in this case) for the TOC
        // We must do this *after* injecting the HTML content
        const headings = contentElement.querySelectorAll('h2');
        let tocHtml = '';

        headings.forEach(heading => {
            const text = heading.textContent;
            // Use the first <h1> text found in the README for the navbar title
            // if (heading.tagName === 'H1' && !repoTitle.dataset.set) {
            //     repoTitle.textContent = text;
            //     repoTitle.dataset.set = true;
            // }

            // Process H2s for the TOC
            // if (heading.tagName === 'H2') {
                const slug = generateSlug(text);
                heading.id = slug; // Assign the ID to the H2 element for linking
                
                // Create a list item for the sidebar TOC
                tocHtml += `<li><a href="#${slug}" title="${text}">${text}</a></li>`;
            // }
        });
        
        // 5. Populate the TOC sidebar
        tocList.innerHTML = tocHtml;

    } catch (error) {
        console.error('Error fetching and rendering README:', error);
        contentElement.innerHTML = `<p style="color: red;">Error loading README: ${error.message}</p>`;
        tocList.innerHTML = '<li>Error loading topics.</li>';
    } finally {
        // 6. Hide the loading message
        loadingElement.style.display = 'none';
    }
}

// Execute the function
fetchAndRenderReadme();