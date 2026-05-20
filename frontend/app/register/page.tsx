'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuItem, DropdownMenuGroup,} from '@/components/ui/dropdown-menu';

type FormData = {
  name: string;
  email: string;
  password: string;
  role: string
};

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState('admin');
  const {register,handleSubmit,setError,formState: { errors, isSubmitting },} = useForm<FormData>();

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch(`http://${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, role }),
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok) {
        setError('root', { message: json.message || 'Registration failed' });
        return;
      }
      router.push('/leads');
    } catch {
      setError('root', { message: 'Network error' });
    }
  }

  return (
    <div className="flex flex-col w-full max-w-md items-start mx-auto h-dvh pt-4 md:pt-20">

      <div className="flex items-center w-full py-8 border-b border-border/80">
        <Link href="/" className="flex items-center gap-x-2">
          <h1 className="text-lg font-medium">GIG FLOW</h1>
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4 py-6">
        <div className="flex flex-col gap-2 w-full">
          <label htmlFor="name" className="text-sm">Name</label>
          <Input
            id="name"
            placeholder="Name"
            className="w-full  text-white "
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-2 w-full">
          <label htmlFor="email" className="text-sm">Email</label>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            className="w-full  text-white "
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-2 w-full">
          <label htmlFor="password" className="text-sm">Password</label>
          <Input
            id="password"
            type="password"
            placeholder="Password"
            className="w-full  text-white "
            {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
          />
          {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
        </div>

        {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}

        <div className="flex flex-col gap-2 w-full">
          <label htmlFor="role" className="text-sm">Role</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className=" text-black ">{role === 'admin' ? 'Admin' : 'Sales User'}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => setRole('admin')}>
                Admin
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setRole('sales')}>
                Sales User
              </DropdownMenuItem>
            </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          {errors.role && <p className="text-sm text-red-600">{errors.role.message}</p>}
        </div>

        <Button type="submit" className="w-full mt-2 cursor-pointer bg-black text-white" disabled={isSubmitting}>{isSubmitting ? 'Registering...' : 'Register'}</Button>
      </form>

      <div className="flex items-start md:mt-auto border-t border-border/80 py-6 w-full">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary">Login</Link>
        </p>
      </div>
    </div>
  );
}
