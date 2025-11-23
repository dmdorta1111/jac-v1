'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ProjectData } from '@/lib/claude-client';

export default function ProjectQuoteForm() {
  const [formData, setFormData] = useState<ProjectData>({
    projectId: '',
    clientName: '',
    projectType: '',
    requirements: '',
    budget: '',
    timeline: '',
    additionalNotes: '',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; content?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent, action: string) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/generate-project-doc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectData: formData,
          action,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: `Documentation saved to: ${data.filename}`,
          content: data.content,
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'An error occurred',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const projectTypes = [
    { value: '', label: 'Select type...' },
    { value: 'web-development', label: 'Web Development' },
    { value: 'mobile-app', label: 'Mobile App' },
    { value: 'enterprise-software', label: 'Enterprise Software' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Project Quote Generator</CardTitle>
        <CardDescription>
          Generate professional project documentation using AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="projectId" className="block text-sm font-medium">
                Project ID <span className="text-destructive">*</span>
              </label>
              <Input
                id="projectId"
                type="text"
                value={formData.projectId}
                onChange={(e) =>
                  setFormData({ ...formData, projectId: e.target.value })
                }
                placeholder="PRJ-2024-001"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="clientName" className="block text-sm font-medium">
                Client Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="clientName"
                type="text"
                value={formData.clientName}
                onChange={(e) =>
                  setFormData({ ...formData, clientName: e.target.value })
                }
                placeholder="Acme Corporation"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="projectType" className="block text-sm font-medium">
              Project Type <span className="text-destructive">*</span>
            </label>
            <select
              id="projectType"
              value={formData.projectType}
              onChange={(e) =>
                setFormData({ ...formData, projectType: e.target.value })
              }
              className={cn(
                "flex h-10 w-full rounded-[10px] border border-input bg-background px-3.5 py-2.5 text-sm shadow-xs transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-primary",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
              required
            >
              {projectTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="requirements" className="block text-sm font-medium">
              Requirements <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) =>
                setFormData({ ...formData, requirements: e.target.value })
              }
              placeholder="Describe the project requirements in detail..."
              className="min-h-[120px]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="budget" className="block text-sm font-medium">
                Budget
              </label>
              <Input
                id="budget"
                type="text"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
                placeholder="e.g., $50,000 - $100,000"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="timeline" className="block text-sm font-medium">
                Timeline
              </label>
              <Input
                id="timeline"
                type="text"
                value={formData.timeline}
                onChange={(e) =>
                  setFormData({ ...formData, timeline: e.target.value })
                }
                placeholder="e.g., 3-6 months"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="additionalNotes" className="block text-sm font-medium">
              Additional Notes
            </label>
            <Textarea
              id="additionalNotes"
              value={formData.additionalNotes}
              onChange={(e) =>
                setFormData({ ...formData, additionalNotes: e.target.value })
              }
              placeholder="Any additional information or special requirements..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              type="button"
              onClick={(e) => handleSubmit(e, 'initial_quote')}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Initial Quote'}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={(e) => handleSubmit(e, 'data_collection')}
              disabled={loading}
            >
              Collect Data
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={(e) => handleSubmit(e, 'final_summary')}
              disabled={loading}
            >
              Final Summary
            </Button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
              <span className="ml-3 text-sm text-muted-foreground">
                Generating documentation...
              </span>
            </div>
          )}

          {result && (
            <div
              className={cn(
                "p-4 rounded-[10px] border",
                result.success
                  ? "bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-900"
                  : "bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-900"
              )}
            >
              <p className="font-medium">
                {result.success ? 'Success' : 'Error'}
              </p>
              <p className="text-sm mt-1">{result.message}</p>
            </div>
          )}

          {result?.success && result.content && (
            <div className="mt-4 p-4 rounded-[10px] border bg-muted/50">
              <p className="text-sm font-medium mb-2">Generated Documentation Preview:</p>
              <pre className="text-xs overflow-auto max-h-[300px] whitespace-pre-wrap">
                {result.content}
              </pre>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
