<?php

namespace App\Http\Controllers;

use App\Models\Classes;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $classes = Classes::orderBy("promo")->orderBy("class")->get()->all();
        $info = [];
        $coaches = [];
        foreach ($classes as $class) {
            $coachRoleId = Role::where('role', 'coach')->value('id');
            $StudentRoleId = Role::where('role', 'student')->value('id');

            $lastCoach = $class->User()
                ->wherePivot('role_id', $coachRoleId)
                ->orderByPivot('created_at', 'desc')
                ->first();
            if ($lastCoach) {
                $tmp["coach"] = $lastCoach["name"];
                if(!in_array($lastCoach["name"],$coaches))
                    {
                        $coaches[] = $lastCoach["name"];
                    }
            }
            $studentNum = $class->User()
                ->wherePivot("role_id", $StudentRoleId)
                ->get()->count();
            $tmp["student_num"] = $studentNum;
            $tmp["class"] = $class->class;
            $tmp["promo"] = $class->promo;
            $tmp["type"] = $class->type;
            $info[] = $tmp;
        }
        return Inertia::render('classes/index', [
            "items" => array_values($info),
            "coaches" => $coaches,

        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Classes $classes)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Classes $classes)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Classes $classes)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Classes $classes)
    {
        //
    }
}
