<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['slug', 'name', 'category', 'position', 'content'])]
class Program extends Model
{
    protected function casts(): array
    {
        return ['content' => 'array', 'position' => 'integer'];
    }

    public function catalogData(): array
    {
        return [...$this->content, 'slug' => $this->slug, 'name' => $this->name, 'category' => $this->category];
    }
}
