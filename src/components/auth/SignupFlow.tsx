import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus } from "lucide-react";
import { AppRole } from "@/types/database";

interface SignupFlowProps {
  onSwitchToSignin: () => void;
}

const SignupFlow: React.FC<SignupFlowProps> = ({ onSwitchToSignin }) => {

  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AppRole>("student");
  const [branch, setBranch] = useState("");
  const [loading, setLoading] = useState(false);

  const branches = [
    "Computer Science",
    "Artificial Intelligence and Data Science",
    "Electronics and Telecommunication",
    "Electrical",
    "Mechanical",
    "Civil",
  ];

  const handleSignup = async () => {

    if (!email || !fullName || !branch || password.length < 6) {
      toast({
        title: "Invalid details",
        description: "Please fill all fields correctly",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {

      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password
      });

      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      await supabase.from("profiles").insert([
  {
    user_id: data.user!.id,
    email: email,
    full_name: fullName,
    department: branch
  }
]);

      toast({
        title: "Account created!",
        description: "You can now login",
      });

      navigate("/auth");

    } catch (err) {

      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });

    }

    setLoading(false);
  };

  return (

    <div className="space-y-6">

      <div className="text-center">
        <UserPlus className="mx-auto mb-2"/>
        <p>Create your AllySphere account</p>
      </div>

      <Input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
      />

      <Input
        placeholder="Full Name"
        value={fullName}
        onChange={(e)=>setFullName(e.target.value)}
      />

      <Select value={role} onValueChange={(v)=>setRole(v as AppRole)}>
        <SelectTrigger>
          <SelectValue placeholder="Select role"/>
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="student">Student</SelectItem>
          <SelectItem value="alumni">Alumni</SelectItem>
          <SelectItem value="faculty">Faculty</SelectItem>
        </SelectContent>
      </Select>

      <Select value={branch} onValueChange={setBranch}>
        <SelectTrigger>
          <SelectValue placeholder="Select branch"/>
        </SelectTrigger>

        <SelectContent>
          {branches.map((b)=>(
            <SelectItem key={b} value={b}>{b}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="password"
        placeholder="Password (min 6 characters)"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
      />

      <Button onClick={handleSignup} className="w-full">

        {loading
        ? <Loader2 className="animate-spin"/>
        : "Create Account"}

      </Button>

      <div className="text-center">

        <button onClick={onSwitchToSignin}>
          Already have an account? Sign in
        </button>

      </div>

    </div>

  );
};

export default SignupFlow;