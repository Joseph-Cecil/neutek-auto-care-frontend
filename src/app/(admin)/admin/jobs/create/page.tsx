'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useCreateJob }  from '@/hooks/useAdminJobs';
import { createJobSchema, type CreateJobFormData } from '@/lib/validations/job.schema';

export default function AdminCreateJobPage() {
  const router = useRouter();
  const { mutate: createJob, isPending } = useCreateJob();

  const form = useForm<CreateJobFormData>({
    resolver:      zodResolver(createJobSchema),
    defaultValues: { title: '', priority: 'normal', description: '', intakeNotes: '' },
  });

  const onSubmit = (data: CreateJobFormData) => {
    createJob(data, {
      onSuccess: (res) => {
        router.push('/admin/jobs/' + res.data.data.id);
      },
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/admin/jobs">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Jobs
        </Button>
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Create Job</h1>
        <p className="mt-1 text-muted-foreground">Create a new repair job</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Job Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Engine diagnostic and brake replacement" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="customerId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="UUID" className="font-mono text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="vehicleId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="UUID" className="font-mono text-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="priority" render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description <span className="text-muted-foreground">(optional)</span></FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Additional details..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="intakeNotes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Intake Notes <span className="text-muted-foreground">(optional)</span></FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Notes at vehicle intake..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="estimatedCompletionAt" render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Completion <span className="text-muted-foreground">(optional)</span></FormLabel>
                  <FormControl>
                    <Input {...field} type="datetime-local" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending && <LoadingSpinner size="sm" className="mr-2" />}
                Create Job
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}