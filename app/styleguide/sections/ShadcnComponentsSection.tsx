import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

export function ShadcnComponentsSection() {
  return (
    <div className="space-y-10">
      {/* Buttons */}
      <div>
        <h3 className="text-section-title text-heading mb-4">Button</h3>
        <p className="text-xs text-muted mb-3">
          <code className="font-mono-nums text-accent-primary">default</code> mirrors{" "}
          <code className="font-mono-nums text-muted">.noir-btn-primary</code> — blue glow on hover.
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 items-center">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">
            <Info className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-3 p-3 bg-noir-active rounded-interactive font-mono-nums text-xs text-muted">
          {
            '<Button variant="default|secondary|tertiary|outline|ghost|destructive|link" size="sm|default|lg|icon">'
          }
        </div>
      </div>

      {/* Badges */}
      <div>
        <h3 className="text-section-title text-heading mb-4">Badge</h3>
        <div className="flex flex-wrap gap-3 items-center">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="tertiary">Tertiary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="positive">Positive</Badge>
          <Badge variant="negative">Negative</Badge>
          <Badge variant="warning">Warning</Badge>
        </div>
        <div className="mt-3 p-3 bg-noir-active rounded-interactive font-mono-nums text-xs text-muted">
          {
            '<Badge variant="default|secondary|tertiary|destructive|outline|positive|negative|warning">'
          }
        </div>
      </div>

      {/* Card */}
      <div>
        <h3 className="text-section-title text-heading mb-4">Card</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description text</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Card body content goes here.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Balance</CardTitle>
              <CardDescription>February 2026</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-hero-number font-display text-heading">R$ 4.210,00</p>
              <p className="text-xs text-muted mt-1">+12% from last month</p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-3 p-3 bg-noir-active rounded-interactive font-mono-nums text-xs text-muted">
          {"<Card><CardHeader><CardTitle/><CardDescription/></CardHeader><CardContent/></Card>"}
        </div>
      </div>

      {/* Input */}
      <div>
        <h3 className="text-section-title text-heading mb-4">Input</h3>
        <div className="flex flex-col gap-3 max-w-sm">
          <Input placeholder="Email address" type="email" />
          <Input placeholder="Password" type="password" />
          <Input placeholder="Disabled input" disabled />
        </div>
        <div className="mt-3 p-3 bg-noir-active rounded-interactive font-mono-nums text-xs text-muted">
          {'<Input placeholder="..." type="text|email|password" />'}
        </div>
      </div>

      {/* Alert */}
      <div>
        <h3 className="text-section-title text-heading mb-4">Alert</h3>
        <div className="flex flex-col gap-3 max-w-lg">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              This is an informational alert with default styling.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Something went wrong. Please try again.</AlertDescription>
          </Alert>
        </div>
        <div className="mt-3 p-3 bg-noir-active rounded-interactive font-mono-nums text-xs text-muted">
          {'<Alert variant="default|destructive"><AlertTitle/><AlertDescription/></Alert>'}
        </div>
      </div>

      {/* Separator */}
      <div>
        <h3 className="text-section-title text-heading mb-4">Separator</h3>
        <div className="flex flex-col gap-4 max-w-sm">
          <div>
            <p className="text-sm text-heading">Above separator</p>
            <Separator className="my-3" />
            <p className="text-sm text-muted">Below separator (horizontal)</p>
          </div>
          <div className="flex items-center h-10 gap-4">
            <p className="text-sm text-body">Left</p>
            <Separator orientation="vertical" />
            <p className="text-sm text-body">Right (vertical)</p>
          </div>
        </div>
        <div className="mt-3 p-3 bg-noir-active rounded-interactive font-mono-nums text-xs text-muted">
          {'<Separator orientation="horizontal|vertical" />'}
        </div>
      </div>

      {/* Select */}
      <div>
        <h3 className="text-section-title text-heading mb-4">Select</h3>
        <p className="text-xs text-muted mb-3">
          Replaces <code className="font-mono-nums text-accent-primary">.noir-select</code> — Radix
          UI popover-based dropdown with keyboard navigation.
        </p>
        <div className="flex flex-wrap gap-4 max-w-sm">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="food">Food &amp; Drink</SelectItem>
              <SelectItem value="transport">Transport</SelectItem>
              <SelectItem value="housing">Housing</SelectItem>
              <SelectItem value="health">Health</SelectItem>
            </SelectContent>
          </Select>
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder="Disabled" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="x">Option</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-3 p-3 bg-noir-active rounded-interactive font-mono-nums text-xs text-muted">
          {
            '<Select><SelectTrigger><SelectValue placeholder="..."/></SelectTrigger><SelectContent><SelectItem value="...">...</SelectItem></SelectContent></Select>'
          }
        </div>
      </div>

      {/* Progress */}
      <div>
        <h3 className="text-section-title text-heading mb-4">Progress</h3>
        <p className="text-xs text-muted mb-3">
          Replaces <code className="font-mono-nums text-accent-primary">.noir-progress-track</code>{" "}
          — self-contained, no inner div needed.
        </p>
        <div className="flex flex-col gap-4 max-w-sm">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-muted">Budget used</span>
              <span className="text-xs text-accent-positive">33%</span>
            </div>
            <Progress value={33} />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-muted">Monthly target</span>
              <span className="text-xs text-accent-warning">65%</span>
            </div>
            <Progress value={65} />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-muted">Savings goal</span>
              <span className="text-xs text-accent-negative">90%</span>
            </div>
            <Progress value={90} />
          </div>
        </div>
        <div className="mt-3 p-3 bg-noir-active rounded-interactive font-mono-nums text-xs text-muted">
          {"<Progress value={65} />"}
        </div>
      </div>

      {/* Table */}
      <div>
        <h3 className="text-section-title text-heading mb-4">Table</h3>
        <p className="text-xs text-muted mb-3">
          Replaces <code className="font-mono-nums text-accent-primary">.noir-table</code> — each
          cell must be wrapped explicitly with TableHead / TableCell.
        </p>
        <div className="max-w-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Supermarket run</TableCell>
                <TableCell>
                  <Badge variant="secondary">Food</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-accent-negative font-mono-nums">−R$ 320,00</span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Monthly salary</TableCell>
                <TableCell>
                  <Badge variant="positive">Income</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-accent-positive font-mono-nums">+R$ 6.500,00</span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Internet bill</TableCell>
                <TableCell>
                  <Badge variant="warning">Utilities</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-accent-negative font-mono-nums">−R$ 99,90</span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div className="mt-3 p-3 bg-noir-active rounded-interactive font-mono-nums text-xs text-muted">
          {
            "<Table><TableHeader><TableRow><TableHead/></TableRow></TableHeader><TableBody><TableRow><TableCell/></TableRow></TableBody></Table>"
          }
        </div>
      </div>

      {/* Token mapping verification */}
      <div>
        <h3 className="text-section-title text-heading mb-4">Token Mapping Verification</h3>
        <p className="text-sm text-muted mb-4">
          These shadcn components should look visually consistent with their Noir equivalents above.
          If colors diverge, check the HSL values in the{" "}
          <code className="font-mono-nums text-accent-primary text-xs">globals.css</code>{" "}
          compatibility layer. New additions in this section:{" "}
          <code className="font-mono-nums text-accent-primary text-xs">Select</code>,{" "}
          <code className="font-mono-nums text-accent-primary text-xs">Progress</code>,{" "}
          <code className="font-mono-nums text-accent-primary text-xs">Table</code>.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="noir-card p-4">
            <p className="text-xs text-muted mb-2">Noir: .noir-card</p>
            <p className="text-sm text-heading">Surface background</p>
            <p className="text-xs text-muted mt-1">Border and shadow from Noir tokens</p>
          </div>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted mb-2">shadcn: {"<Card>"}</p>
              <p className="text-sm text-heading">Surface background</p>
              <p className="text-xs text-muted mt-1">Border and shadow from shadcn tokens</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
