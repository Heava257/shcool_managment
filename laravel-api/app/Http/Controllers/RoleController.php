<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Role;

class RoleController extends Controller
{
    public function index()
    {

        return response()->json([
            "list"=>Role::all()
        ]);
       
    }

    public function store(Request $request)
    {


        $role = new Role();

        $role->name =$request->input("name");
        $role->code =$request->input("code");
        $role->description =$request->input("description");
        $role->status =$request->input("status");
        $role->save();
        return [
            "data" =>$role,
            "message"=>"Insert Successfully"
        ];
    
    }

    
    public function show(string $id)
    {

        return Role::find($id);
    }

  
    public function update(Request $request, string $id)
    {
        $role =  Role::find($id);
        if(!$role){
            return [
                "error"=>true,
                "message"=>"Data not found"
            ];
        }else{
            $role->name=$request->input("name");
            $role->code=$request->input("code");
            $role->description=$request->input("description");
            $role->status=$request->input("status");
            $role->update();
            return [
                "data"=>$role,
                "message" =>"Insert SuccessFully!"
            ];
        }

    }

    
    public function destroy(string $id)
    {
        $role = Role::find($id);

        if(!$role){
            return [ 
                "error" =>true,
                "message" =>"Delete not found"
            ];
        }else{
            $role->delete();
            return [
                "data"  => $role,
                "message"=>"Delete SuceessFully"
            ];
        }
    }

    public function changStatue(Request $request ,$id)
    {
       $role = Role::find($id);
       if(!$role){
        return [
            "error" => true,
            "message"=>"Unknoe status"
        ];
       }else{
        $role ->status=$request->input("status");
        $role->update();
        return[
            "data"=>$role,
            "message"=>"Status update Sucees! (".$role->status.")"

        ];
       }

    }
}
