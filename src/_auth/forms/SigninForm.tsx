import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { SigninValidation } from "@/lib/validation";
import Loader from "@/components/shared/Loader";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSignInUserMutation } from "@/lib/react-query/queryAndMutation";
import { useAuthContext } from "@/context/AuthContext";

const SigninForm = () => {
  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  const { checkAuthUser, isLoading: isUserLoading } = useAuthContext();

  const { mutateAsync: signInAccount, isPending: isSigningIn } =
    useSignInUserMutation();

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof SigninValidation>) {
    const session = await signInAccount({
      email: values.email,
      password: values.password,
    });

    if (!session) {
      return toast({
        title: "Sign-In failed, please try again",
      });
    }
    const isLogged = await checkAuthUser();
    if (isLogged) {
      form.reset();
      navigate("/");
    } else {
      toast({
        title: "Failed to create account, please try again",
      });
    }
  }

  return (
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">
        <img src="/assets/images/logo.svg" alt="logo" />
        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Log In to your Account</h2>
        <p className="text-light-3 small-medium  md:base-regular mt-2">
          Welcome back, Please enter your details
        </p>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col w-full gap-5 mt-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" className="shad-input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="shad-button_primary">
          {isSigningIn || isUserLoading ? (
              <div className="flex-center gap-2">
                <Loader />
                Loading ...
              </div>
            ) : (
              "Sign In"
            )}
          </Button>
          <p className="text-small-regular text-light-2 text-center mt-2">
            Create a new account?
            <Link
              to="/sign-up"
              className="text-small-semibold ml-1 text-primary-500"
            >
              Sign-up
            </Link>
          </p>
        </form>
      </div>
    </Form>
  );
};

export default SigninForm;
