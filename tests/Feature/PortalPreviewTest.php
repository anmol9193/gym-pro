<?php

namespace Tests\Feature;

use Tests\TestCase;

class PortalPreviewTest extends TestCase
{
    public function test_preview_pages_render_without_authentication_or_database_queries(): void
    {
        $this->app['db']->listen(fn () => $this->fail('The visual preview must not query the database.'));
        $this->get('/login')->assertOk()->assertSee('Preview dashboard')->assertSee('Credentials are not submitted.');
        $this->get('/dashboard')->assertOk()->assertSee('SAMPLE DATA')->assertSee('Demo administrator');
        $this->post('/login', ['email' => 'example@example.test', 'password' => 'example'])->assertStatus(405);
        foreach (['/admin/dashboard', '/admin/users', '/admin/roles', '/receptionist/dashboard', '/trainer/dashboard', '/member/dashboard', '/account'] as $removedRoute) {
            $this->get($removedRoute)->assertNotFound();
        }
    }
}
