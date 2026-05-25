<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class DocumentationController extends Controller
{
    public function __invoke(?string $slug = null): Response
    {
        $slug ??= $this->defaultSlug();
        $page = $this->page($slug);
        $markdown = File::get($page['file']);

        return Inertia::render('documentation/show', [
            'document' => [
                'slug' => $slug,
                'title' => $page['title'],
                'description' => $page['description'],
                'html' => $this->html($markdown),
            ],
            'navigation' => $this->navigation($slug),
        ]);
    }

    private function defaultSlug(): string
    {
        $slug = config('documentation.default');

        if (! is_string($slug) || $slug === '') {
            throw new NotFoundHttpException;
        }

        return $slug;
    }

    /**
     * @return array{title: string, description: string, file: string}
     */
    private function page(string $slug): array
    {
        $page = config("documentation.pages.{$slug}");

        if (! is_array($page) || ! isset($page['title'], $page['description'], $page['file'])) {
            throw new NotFoundHttpException;
        }

        if (! File::exists($page['file'])) {
            throw new NotFoundHttpException;
        }

        return [
            'title' => (string) $page['title'],
            'description' => (string) $page['description'],
            'file' => (string) $page['file'],
        ];
    }

    private function html(string $markdown): string
    {
        $headings = $this->headings($markdown);
        $html = (string) Str::of($markdown)->markdown([
            'html_input' => 'strip',
            'allow_unsafe_links' => false,
        ]);

        $html = $this->replaceTocPlaceholder($html, $headings);

        return $this->addHeadingIds($html, $headings);
    }

    /**
     * @return array<int, array{level: int, title: string, id: string}>
     */
    private function headings(string $markdown): array
    {
        preg_match_all('/^(#{1,6})\s+(.+?)\s*#*\s*$/m', $markdown, $matches, PREG_SET_ORDER);

        $headings = [];
        $usedSlugs = [];
        $levels = $this->tocLevels();

        foreach ($matches as $match) {
            $level = strlen($match[1]);

            if (! in_array($level, $levels, true)) {
                continue;
            }

            $title = $this->plainHeadingText($match[2]);

            $headings[] = [
                'level' => $level,
                'title' => $title,
                'id' => $this->uniqueHeadingId($title, $usedSlugs),
            ];
        }

        return $headings;
    }

    /**
     * @return array<int, int>
     */
    private function tocLevels(): array
    {
        $levels = config('documentation.toc.levels', [2, 3]);

        if (! is_array($levels)) {
            return [2, 3];
        }

        return collect($levels)
            ->map(fn (mixed $level): int => (int) $level)
            ->filter(fn (int $level): bool => $level >= 1 && $level <= 6)
            ->unique()
            ->values()
            ->all();
    }

    private function plainHeadingText(string $heading): string
    {
        $html = (string) Str::of($heading)->inlineMarkdown([
            'html_input' => 'strip',
            'allow_unsafe_links' => false,
        ]);

        return trim(html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
    }

    /**
     * @param  array<string, int>  $usedSlugs
     */
    private function uniqueHeadingId(string $title, array &$usedSlugs): string
    {
        $base = Str::slug($title);

        if ($base === '') {
            $base = 'section';
        }

        $usedSlugs[$base] = ($usedSlugs[$base] ?? 0) + 1;

        if ($usedSlugs[$base] === 1) {
            return $base;
        }

        return "{$base}-{$usedSlugs[$base]}";
    }

    /**
     * @param  array<int, array{level: int, title: string, id: string}>  $headings
     */
    private function replaceTocPlaceholder(string $html, array $headings): string
    {
        $placeholder = config('documentation.toc.placeholder', '{{TOC}}');

        if (! is_string($placeholder) || $placeholder === '') {
            return $html;
        }

        return str_replace(
            ["<p>{$placeholder}</p>", $placeholder],
            $this->tocHtml($headings),
            $html,
        );
    }

    /**
     * @param  array<int, array{level: int, title: string, id: string}>  $headings
     */
    private function tocHtml(array $headings): string
    {
        if ($headings === []) {
            return '';
        }

        $items = collect($this->numberedHeadings($headings))
            ->map(fn (array $heading): string => sprintf(
                '<li class="toc-level-%d"><a href="#%s"><span class="toc-number">%s</span> %s</a></li>',
                $heading['level'],
                e($heading['id']),
                e($heading['number']),
                e($heading['title']),
            ))
            ->implode('');

        return '<nav class="documentation-toc" aria-label="Table of contents"><p>On this page</p><ol>'.$items.'</ol></nav>';
    }

    /**
     * @param  array<int, array{level: int, title: string, id: string}>  $headings
     * @return array<int, array{level: int, title: string, id: string, number: string}>
     */
    private function numberedHeadings(array $headings): array
    {
        $currentH2 = 0;
        $currentH3 = 0;

        return collect($headings)
            ->map(function (array $heading) use (&$currentH2, &$currentH3): array {
                if ($heading['level'] === 2) {
                    $currentH2++;
                    $currentH3 = 0;

                    return [...$heading, 'number' => (string) $currentH2];
                }

                if ($heading['level'] === 3) {
                    if ($currentH2 === 0) {
                        $currentH2 = 1;
                    }

                    $currentH3++;

                    return [...$heading, 'number' => "{$currentH2}.{$currentH3}"];
                }

                return [...$heading, 'number' => ''];
            })
            ->all();
    }

    /**
     * @param  array<int, array{level: int, title: string, id: string}>  $headings
     */
    private function addHeadingIds(string $html, array $headings): string
    {
        $levels = $this->tocLevels();

        if ($headings === [] || $levels === []) {
            return $html;
        }

        $levelPattern = implode('', $levels);
        $headingIndex = 0;

        return (string) preg_replace_callback(
            "/<h([{$levelPattern}])>(.*?)<\/h\\1>/s",
            function (array $match) use ($headings, &$headingIndex): string {
                $heading = $headings[$headingIndex] ?? null;
                $headingIndex++;

                if ($heading === null) {
                    return $match[0];
                }

                return sprintf(
                    '<h%d id="%s">%s</h%d>',
                    (int) $match[1],
                    e($heading['id']),
                    $match[2],
                    (int) $match[1],
                );
            },
            $html,
        );
    }

    /**
     * @return array<int, array{slug: string, title: string, url: string, active: bool}>
     */
    private function navigation(string $activeSlug): array
    {
        $pages = config('documentation.pages', []);

        if (! is_array($pages)) {
            return [];
        }

        return collect($pages)
            ->map(fn (array $page, string $slug): array => [
                'slug' => $slug,
                'title' => (string) $page['title'],
                'url' => route('documentation.show', ['slug' => $slug], false),
                'active' => $slug === $activeSlug,
            ])
            ->values()
            ->all();
    }
}
