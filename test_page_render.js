const { getArticleDocument } = require('./lib/content');
const path = require('path');

async function testInternal() {
    try {
        const slug = 'something-big-is-happening';
        const lang = 'en';
        const format = 'full';

        console.log(`Testing getArticleDocument for ${lang}/${slug}/${format}`);
        const article = await getArticleDocument({ slug, lang, format });
        console.log('Article found:', !!article);

        if (article) {
            console.log('Author:', article.meta.author);
            console.log('Meta:', JSON.stringify(article.meta, null, 2));
            console.log('Frontmatter:', article.frontmatter);
        }

        // mimic ArticlePage logic
        if (article) {
            // Line 160 check
            console.log('Byline:', article.frontmatter.byline);

            // Line 173 check
            if (article.meta.author?.xUrl) {
                console.log('Author X URL present:', article.meta.author.xUrl);
                console.log('Author Display:', article.meta.author.xHandle ?? article.meta.author.name);
            }

            // Line 313 check (the one we fixed)
            if (article.meta.author?.xUrl) {
                console.log('Credit link safe');
            } else {
                console.log('Credit name safe:', article.meta.author?.name);
            }
        }

    } catch (error) {
        console.error('CRASHED:', error);
    }
}

testInternal();
