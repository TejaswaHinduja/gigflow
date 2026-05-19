'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type FormData = { name: string; email: string; password: string };

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch('http://localhost:2000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError('root', { message: json.message || 'Registration failed' });
        return;
      }
      localStorage.setItem('token', json.token);
      router.push('/leads');
    } catch {
      setError('root', { message: 'Network error' });
    }
  }

  return (
    <div className="flex flex-col items-start max-w-sm mx-auto h-dvh pt-4 md:pt-20">

      <div className="flex items-center w-full py-8 border-b border-border/80">
        <Link href="/" className="flex items-center gap-x-2">
          <h1 className="text-lg font-medium">hire</h1>
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4 py-6">
        <div className="flex flex-col gap-2 w-full">
          <label htmlFor="name" className="text-sm">Name</label>
          <Input
            id="name"
            placeholder="Name"
            className="w-full"
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
            className="w-full"
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
            className="w-full"
            {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
          />
          {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
        </div>

        {errors.root && <p className="text-sm text-red-600">{errors.root.message}</p>}

        <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>{isSubmitting ? 'Registering...' : 'Register'}</Button>
      </form>

      <div className="flex items-start mt-auto border-t border-border/80 py-6 w-full">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary">Login</Link>
        </p>
      </div>
    </div>
  );
}
