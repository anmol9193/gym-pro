<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['slug', 'name', 'category', 'supplement_type', 'position', 'content'])]
class Product extends Model
{
    protected function casts(): array
    {
        return ['content' => 'array', 'position' => 'integer'];
    }

    public function catalogData(): array
    {
        return [
            ...$this->content,
            'slug' => $this->slug,
            'name' => $this->name,
            'category' => $this->category,
            'supplementType' => $this->supplement_type,
            'number' => str_pad((string) ($this->position + 1), 2, '0', STR_PAD_LEFT),
        ];
    }
}
