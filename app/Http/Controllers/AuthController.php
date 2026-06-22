<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

use function Illuminate\Log\log;

class AuthController extends Controller
{

    public function login()
    {
        if (Auth::check()) {
            return redirect("/dashboard");
        }
        return redirect(env("CENTRAL_HOST_URL") . env("CENTRAL_HOST_AUTH"));
    }


    public function loginCallback(string $code): ?RedirectResponse
    {
        // every call to mylionsgeek to academy specific route requires "x-api-key" header to be included in this case it is a secrete code

        // mylionsGeek seends a code in the route callback ,
        //  that code is sent back to get a token containing the current user info
        try {
            $token = Http::withHeaders([
                "x-api-key" => env("CLIENT_SECRET"),
                "code" => $code,
            ])->get(env("CENTRAL_HOST_URL") . env("CENTRAL_HOST_TOKEN"));
            $token->throw();
        } catch (\Throwable $th) {
            log($th->getCode() ?? "Connection failed" . " : " . $th->getMessage() ?? "somthing went wrong");
            return redirect()->intended();
        }
        if (!$token["central_id"]) {
            return response()->redirectTo("/");
        }

        // if user does not exist create one else just
        //  update the info of the existing user and login the user in
        $user = User::where("central_id", $token["central_id"])->first();
        if (!$user) {
            $user = User::create([
                "central_id" => $token["central_id"] ?? null,
                "name" => $token["name"] ?? "",
                "email" => $token["email"] ?? "",
                "avatar" => $token["avatar"] ?? "",
                "promo" => $token["promo"] ?? "",
                "field" => $token["field"] ?? "",
                "status" => $token["status"] ?? "",
            ]);
        } else {
            $user->update([
                "central_id" => $token["central_id"] ?? null,
                "name" => $token["name"] ?? "",
                "email" => $token["email"] ?? "",
                "avatar" => $token["avatar"] ?? "",
                "promo" => $token["promo"] ?? "",
                "field" => $token["field"] ?? "",
                "status" => $token["status"] ?? "",
            ]);
        }        
        Auth::login($user);
        return redirect()->intended("dashboard");
    }
}
