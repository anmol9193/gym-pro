<?php

namespace App\Support;

use Illuminate\Support\Facades\File;

final class SiteCatalog
{
    private array $products;

    private array $programs;

    public function __construct()
    {
        $products = File::json(resource_path('data/products.json'));
        $this->products = array_map(fn (array $product, int $index): array => [
            ...$product,
            'number' => str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT),
        ], $products, array_keys($products));
        $this->programs = File::json(resource_path('data/programs.json'));
    }

    public function products(): array
    {
        return $this->products;
    }

    public function programs(): array
    {
        return $this->programs;
    }

    public function product(string $slug): ?array
    {
        return $this->find($this->products, $slug);
    }

    public function program(string $slug): ?array
    {
        return $this->find($this->programs, $slug);
    }

    public function productsBySlugs(array $slugs): array
    {
        return array_values(array_filter(array_map($this->product(...), $slugs)));
    }

    public function programsBySlugs(array $slugs): array
    {
        return array_values(array_filter(array_map($this->program(...), $slugs)));
    }

    private function find(array $items, string $slug): ?array
    {
        foreach ($items as $item) {
            if ($item['slug'] === $slug) {
                return $item;
            }
        }

        return null;
    }
}
