<?php

use Illuminate\Support\Facades\File;
use Inertia\Testing\AssertableInertia;

it('shows the default documentation page', function () {
    $this->get(route('documentation.index'))
        ->assertOk()
        ->assertInertia(
            fn (AssertableInertia $page) => $page
                ->component('documentation/show')
                ->where('document.slug', 'categories')
                ->where('document.title', 'Categories')
                ->where('document.description', 'Learn how categories work in Whisper Money.')
                ->where('navigation.0.active', true)
        );
});

it('shows the categories documentation page', function () {
    $this->get(route('documentation.show', ['slug' => 'categories']))
        ->assertOk()
        ->assertInertia(
            fn (AssertableInertia $page) => $page
                ->component('documentation/show')
                ->where('document.slug', 'categories')
                ->where('document.title', 'Categories')
                ->where('navigation.0.url', '/documentation/categories')
        );
});

it('replaces the table of contents placeholder with heading links', function () {
    $this->get(route('documentation.show', ['slug' => 'categories']))
        ->assertOk()
        ->assertInertia(
            fn (AssertableInertia $page) => $page
                ->where('document.html', fn (string $html): bool => ! str_contains($html, '{{TOC}}')
                    && str_contains($html, '<nav class="documentation-toc"')
                    && str_contains($html, 'href="#what-categories-do"')
                    && str_contains($html, 'href="#expense"')
                    && str_contains($html, '<span class="toc-number">1</span> What categories do')
                    && str_contains($html, '<span class="toc-number">2.1</span> Expense')
                    && str_contains($html, '<h2 id="what-categories-do">')
                    && str_contains($html, '<h3 id="expense">')
                    && ! str_contains($html, 'href="#categories"'))
        );
});

it('uses configured heading levels for the table of contents', function () {
    config(['documentation.toc.levels' => [2]]);

    $this->get(route('documentation.show', ['slug' => 'categories']))
        ->assertOk()
        ->assertInertia(
            fn (AssertableInertia $page) => $page
                ->where('document.html', fn (string $html): bool => str_contains($html, 'href="#what-categories-do"')
                    && ! str_contains($html, 'href="#expense"')
                    && str_contains($html, '<h2 id="what-categories-do">')
                    && ! str_contains($html, '<h3 id="expense">'))
        );
});

it('returns not found for unknown documentation pages', function () {
    $this->get('/documentation/unknown')->assertNotFound();
});

it('has markdown files for all configured documentation pages', function () {
    $pages = config('documentation.pages');

    expect($pages)->toBeArray()->not->toBeEmpty();

    foreach ($pages as $page) {
        expect(File::exists($page['file']))->toBeTrue();
    }
});
