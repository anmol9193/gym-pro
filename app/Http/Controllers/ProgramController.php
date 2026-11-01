<?php

namespace App\Http\Controllers;

use App\Support\SiteCatalog;
use Illuminate\Contracts\View\View;

final class ProgramController extends Controller
{
    public function index(): View
    {
        return view('programs.index');
    }

    public function show(string $slug, SiteCatalog $catalog): View
    {
        $program = $catalog->program($slug);
        abort_if($program === null, 404);
        $programs = $catalog->programs();
        $index = array_search($slug, array_column($programs, 'slug'), true);
        $count = count($programs);

        return view('programs.show', [
            'program' => $program,
            'number' => str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT),
            'relatedPrograms' => $catalog->programsBySlugs($program['related']),
            'previous' => $programs[($index - 1 + $count) % $count],
            'following' => $programs[($index + 1) % $count],
        ]);
    }
}
