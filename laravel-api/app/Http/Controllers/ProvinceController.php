<?php

namespace App\Http\Controllers;

use App\Models\Province;
use Illuminate\Http\Request;

class ProvinceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
    //    return Province::all();
    return response ()->json([
        "list" => Province::all()
    ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
       
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
    //     $province =new Province();
    //     $province -> name = $request ->input("name");
    //     $province -> code = $request ->input("code");
    //     $province ->description = $request ->input("description");
    //     $province ->distand_from_city = $request ->input("distand_from_city");
    //     $province ->status = $request ->input("status");
    //     $province ->save();

    //    if(!$province){
    //     return[ 
    //         "error"=>true,
    //         "messsage"=>"No data found"
    //     ];
    //    }else{
    //     return [
    //         "data"=>$province,
    //         "message"=>"create province successfully"
    //     ];
    //    }
    $validation = $request->validate([
        "name" => "required|string",
        "code" => "required|string",
        "description" => "nullable|string",
        "distand_from_city" => "required|numeric",
        "status" => "required|boolean",
    ]);
    $data = Province::create($validation);
    return response ()->json([
        "data"=>$data,
        "message"=>"Create province Succeefully"
    ]);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        return response () ->json([
            "data"=>Province::find($id)
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Province $province)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request , $id)
    {
        $province =  Province::find($id);
      
        if(!$province){
          return [
            "error"=>true,
            "message"=>"No data found"
          ];
      
        }else{
        $province->name=$request->input("name");
        $province->code=$request->input("code");
        $province->description=$request->input("description");
        $province->distand_from_city=$request->input("distand_from_city");
        $province->status=$request->input("status");
        $province->update();
            return [
                "data"=>$province,
                "message"=>"Update Province Successfully"
            ];
        }
         
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
       $province = Province::find($id);
       if(!$province){
        return response ()->json([
            "error"=>[
                "delete" => "Data not found"
            ]

            ]);
       }else{
        $province->delete();
        return response()->json([
            "data"=>$province,
            "message"=>"Data delete Succes"
        ]);
       }
    }
}
