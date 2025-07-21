import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useClinicMonthlyPayments, useCreateClinicMonthlyPayment, useUpdateClinicMonthlyPayment, useDeleteClinicMonthlyPayment } from "@/hooks/useClinicMonthlyPayments";

interface ClinicMonthlyPaymentsProps {
  clinicId: string;
  clinicName: string;
}

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export function ClinicMonthlyPayments({ clinicId, clinicName }: ClinicMonthlyPaymentsProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [amount, setAmount] = useState("");

  const { data: payments = [], isLoading } = useClinicMonthlyPayments(clinicId, selectedYear);
  const createMutation = useCreateClinicMonthlyPayment();
  const updateMutation = useUpdateClinicMonthlyPayment();
  const deleteMutation = useDeleteClinicMonthlyPayment();

  const handleAdd = () => {
    if (!selectedMonth || !amount) return;

    createMutation.mutate({
      clinic_id: clinicId,
      month: selectedMonth,
      year: selectedYear,
      amount: parseFloat(amount),
    }, {
      onSuccess: () => {
        setIsAdding(false);
        setSelectedMonth(null);
        setAmount("");
      }
    });
  };

  const handleUpdate = () => {
    if (!editingId || !amount) return;

    updateMutation.mutate({
      id: editingId,
      amount: parseFloat(amount),
    }, {
      onSuccess: () => {
        setEditingId(null);
        setAmount("");
      }
    });
  };

  const startEdit = (payment: any) => {
    setEditingId(payment.id);
    setAmount(payment.amount.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAmount("");
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const getAvailableMonths = () => {
    const usedMonths = payments.map(p => p.month);
    return MONTHS.filter(month => !usedMonths.includes(month.value));
  };

  const getMonthName = (monthNumber: number) => {
    return MONTHS.find(m => m.value === monthNumber)?.label || "";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Payments - {clinicName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading monthly payments...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-theme-dark-card border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Monthly Payments - {clinicName}</CardTitle>
        <div className="flex items-center gap-2">
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32 bg-theme-dark-lighter border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-theme-dark-card border-gray-600 z-50">
              {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map(year => (
                <SelectItem 
                  key={year} 
                  value={year.toString()}
                  className="text-white hover:bg-theme-dark-lighter focus:bg-theme-dark-lighter"
                >
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!isAdding && getAvailableMonths().length > 0 && (
            <Button onClick={() => setIsAdding(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Monthly Payment
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="p-4 border border-gray-600 rounded-lg space-y-4 bg-theme-dark-lighter">
            <h4 className="font-medium text-white">Add Monthly Payment</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="month" className="text-gray-300">Month</Label>
                <Select 
                  value={selectedMonth?.toString() || ""} 
                  onValueChange={(value) => {
                    console.log('Month selected:', value);
                    setSelectedMonth(parseInt(value));
                  }}
                >
                  <SelectTrigger className="bg-theme-dark-lighter border-gray-600 text-white">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent className="bg-theme-dark-card border-gray-600 z-[9999] max-h-60 overflow-y-auto">
                    {getAvailableMonths().map(month => (
                      <SelectItem 
                        key={month.value} 
                        value={month.value.toString()}
                        className="text-white hover:bg-theme-dark-lighter focus:bg-theme-dark-lighter cursor-pointer"
                      >
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount" className="text-gray-300">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  className="bg-theme-dark-lighter border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleAdd} disabled={!selectedMonth || !amount}>
                  Add
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsAdding(false);
                  setSelectedMonth(null);
                  setAmount("");
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {payments.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No monthly payments recorded for {selectedYear}
            </p>
          ) : (
            payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{getMonthName(payment.month)}</Badge>
                  <span className="font-medium">${payment.amount.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {editingId === payment.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-24"
                        step="0.01"
                        min="0"
                      />
                      <Button size="sm" onClick={handleUpdate}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={() => startEdit(payment)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(payment.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}