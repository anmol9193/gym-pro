<?php

namespace App\Support;

use App\Models\Product;
use App\Models\Program;

final class SiteCatalog
{
    private array $products;

    private array $programs;

    public function __construct()
    {
        $this->products = Product::orderBy('position')->get()->map->catalogData()->all();
        $this->programs = Program::orderBy('position')->get()->map->catalogData()->all();
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
