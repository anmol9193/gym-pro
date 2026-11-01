<?php

namespace Tests\Feature;

use App\Support\SiteCatalog;
use Database\Seeders\CatalogSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

final class WebsiteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(CatalogSeeder::class);
    }

    public static function mainPages(): array
    {
        return [
            ['/', 'pages.home'],
            ['/programs', 'programs.index'],
            ['/products', 'products.index'],
            ['/our-approach', 'pages.approach'],
            ['/membership', 'pages.membership'],
            ['/contact', 'pages.contact'],
        ];
    }

    #[DataProvider('mainPages')]
    public function test_main_pages_render_shared_layout_and_canonical_links(string $path, string $view): void
    {
        $response = $this->get($path)->assertOk()->assertViewIs($view)
            ->assertSee('assets/responsive.css', false)
            ->assertSee('Anmol Saini');
        $html = $response->getContent();

        $this->assertSame(1, substr_count($html, '<main id="main">'));
        $this->assertSame(1, substr_count($html, '<h1'));
        $this->assertDoesNotMatchRegularExpression('/href="[^"\s]*\.html/', $html);
        $this->assertDoesNotMatchRegularExpression('/(?:src|href)="assets\//', $html);
        $this->assertSame(1, substr_count($html, '<nav class="navbar"'));
        preg_match('/<ul class="nav-links"[^>]*>(.*?)<\/ul>/s', $html, $navigation);
        $this->assertStringNotContainsString('aria-current="location"', $navigation[1]);
        $this->assertSame($path === '/contact' ? 0 : 1, substr_count($navigation[1], 'aria-current="page"'));
    }

    public function test_every_product_has_a_data_backed_detail_page_and_enquiry(): void
    {
        $catalog = app(SiteCatalog::class);
        $this->assertCount(14, $catalog->products());

        foreach ($catalog->products() as $product) {
            $this->get(route('products.show', $product['slug']))->assertOk()
                ->assertViewIs('products.show')
                ->assertSee('<h1>'.e($product['name']).'</h1>', false)
                ->assertSee('product='.$product['slug'], false)
                ->assertSee($product['slug'].'-3.jpg', false);
        }
    }

    public function test_every_program_has_a_data_backed_detail_page(): void
    {
        foreach (app(SiteCatalog::class)->programs() as $program) {
            $this->get(route('programs.show', $program['slug']))->assertOk()
                ->assertViewIs('programs.show')
                ->assertSee($program['name'])
                ->assertSee($program['overview']);
        }
    }

    public function test_catalog_and_contact_use_the_same_product_source(): void
    {
        $catalog = app(SiteCatalog::class);
        $html = $this->get('/products')->assertOk()->getContent();
        $this->assertSame(count($catalog->products()), substr_count($html, '<article class="product-card"'));
        $this->assertSame(8, count(array_filter($catalog->products(), fn (array $product): bool => $product['category'] === 'supplements')));

        $contact = $this->get('/contact')->assertOk();
        foreach ($catalog->products() as $product) {
            $contact->assertSee('<option value="'.$product['slug'].'">'.e($product['name']).'</option>', false);
        }
    }

    public function test_legacy_links_redirect_without_losing_enquiry_or_filter_queries(): void
    {
        $this->get('/index.html')->assertRedirect('/')->assertStatus(301);
        $this->get('/contact.html?product=whey-protein')->assertRedirect('/contact?product=whey-protein');
        $this->get('/products.html?category=supplements&type=protein')->assertRedirect('/products?category=supplements&type=protein');
        $this->get('/strength-training.html')->assertRedirect('/programs/strength-training');
        $this->get('/product-whey-protein.html')->assertRedirect('/products/whey-protein');

        foreach (app(SiteCatalog::class)->products() as $product) {
            $this->get('/product-'.$product['slug'].'.html')->assertRedirect('/products/'.$product['slug']);
        }
    }

    public function test_unknown_catalog_pages_and_legacy_paths_return_404(): void
    {
        foreach (['/products/not-a-product', '/programs/not-a-program', '/not-a-page.html', '/.env'] as $path) {
            $this->get($path)->assertNotFound();
        }
    }
}
