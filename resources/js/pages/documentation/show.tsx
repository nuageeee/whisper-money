import { type SharedData } from '@/types';
import { __ } from '@/utils/i18n';
import { Head, Link, usePage } from '@inertiajs/react';

type DocumentationDocument = {
    slug: string;
    title: string;
    description: string;
    html: string;
};

type NavigationItem = {
    slug: string;
    title: string;
    url: string;
    active: boolean;
};

type DocumentationShowProps = {
    document: DocumentationDocument;
    navigation: NavigationItem[];
};

export default function DocumentationShow({
    document,
    navigation,
}: DocumentationShowProps) {
    const { appUrl } = usePage<SharedData>().props;

    return (
        <>
            <Head title={__(document.title)}>
                <meta name="description" content={__(document.description)} />
                <link
                    rel="canonical"
                    href={`${appUrl}/documentation/${document.slug}`}
                />
                <meta name="robots" content="index, follow" />
                <meta property="og:title" content={__(document.title)} />
                <meta
                    property="og:description"
                    content={__(document.description)}
                />
                <meta property="og:type" content="article" />
                <meta
                    property="og:url"
                    content={`${appUrl}/documentation/${document.slug}`}
                />
            </Head>

            <div className="min-h-screen bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
                <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10 lg:flex-row lg:px-8 lg:py-16">
                    <aside className="lg:w-64 lg:shrink-0">
                        <Link
                            href="/"
                            className="mb-8 inline-block text-sm text-[#706f6c] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:text-[#EDEDEC]"
                        >
                            {__('\u2190 Back to home')}
                        </Link>

                        <nav aria-label={__('Documentation')}>
                            <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-[#706f6c] uppercase dark:text-[#A1A09A]">
                                {__('Documentation')}
                            </p>
                            <div className="flex flex-col gap-1">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.slug}
                                        href={item.url}
                                        className={
                                            item.active
                                                ? 'rounded-lg bg-[#1b1b18] px-3 py-2 text-sm font-medium text-white dark:bg-[#EDEDEC] dark:text-[#1b1b18]'
                                                : 'rounded-lg px-3 py-2 text-sm text-[#706f6c] hover:bg-black/5 hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:bg-white/10 dark:hover:text-[#EDEDEC]'
                                        }
                                    >
                                        {__(item.title)}
                                    </Link>
                                ))}
                            </div>
                        </nav>
                    </aside>

                    <main className="min-w-0 flex-1">
                        <article
                            className="max-w-3xl [&_.documentation-toc]:my-8 [&_.documentation-toc]:rounded-xl [&_.documentation-toc]:border [&_.documentation-toc]:border-black/10 [&_.documentation-toc]:p-5 dark:[&_.documentation-toc]:border-white/10 [&_.documentation-toc_.toc-level-3]:pl-4 [&_.documentation-toc_.toc-number]:text-[#706f6c] dark:[&_.documentation-toc_.toc-number]:text-[#A1A09A] [&_.documentation-toc_a]:no-underline [&_.documentation-toc_ol]:m-0 [&_.documentation-toc_ol]:list-none [&_.documentation-toc_ol]:space-y-2 [&_.documentation-toc_ol]:p-0 [&_.documentation-toc_p]:mb-3 [&_.documentation-toc_p]:text-sm [&_.documentation-toc_p]:font-semibold [&_a]:font-medium [&_a]:text-[#1b1b18] [&_a]:underline dark:[&_a]:text-[#EDEDEC] [&_h1]:mb-5 [&_h1]:text-4xl [&_h1]:leading-tight [&_h1]:font-semibold [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:pl-1 [&_p]:mb-5 [&_p]:leading-7 [&_p]:text-[#706f6c] dark:[&_p]:text-[#A1A09A] [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
                            dangerouslySetInnerHTML={{ __html: document.html }}
                        />
                    </main>
                </div>
            </div>
        </>
    );
}
