"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Trash2, Edit, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MeasurementForm } from "@/components/forms/measurement/measurement-form";
import { useMeasurementsStore } from "@/lib/stores/measurements-store";
import {
  LineChart as CustomLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { type Profile } from "@/lib/schemas/profile";

interface MeasurementHistoryProps {
  profile: Profile;
}

export function MeasurementHistory({ profile }: MeasurementHistoryProps) {
  const t = useTranslations("measurementHistory");
  const {
    measurements,
    isLoading,
    error,
    fetchMeasurements,
    deleteMeasurement,
  } = useMeasurementsStore();

  const [selectedMeasurementId, setSelectedMeasurementId] = useState<
    string | null
  >(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    // Cargar mediciones cuando se monta el componente
    fetchMeasurements(profile.id);
  }, [fetchMeasurements, profile.id]);

  // Obtener la medición seleccionada del store
  const selectedMeasurement = selectedMeasurementId
    ? measurements.find((m) => m.id === selectedMeasurementId)
    : null;

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete")))
      return;
    await deleteMeasurement(id);
  };

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedMeasurementId(null);
  };

  // Prepare data for charts - sort by date ascending for proper timeline visualization
  const chartData = [...measurements]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((m) => ({
      date: format(new Date(m.date), "MMM d"),
      weight: m.weight_kg,
      bodyFat: m.body_fat_percentage,
      chest: m.chest_cm,
      waist: m.waist_cm,
      hips: m.hips_cm,
      armLeft: m.arm_left_cm,
      armRight: m.arm_right_cm,
      thighLeft: m.thigh_left_cm,
      thighRight: m.thigh_right_cm,
    }));

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        {t("loading")}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" /> {t("addMeasurement")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{t("addDialogTitle")}</DialogTitle>
                <DialogDescription>{t("addDialogDescription")}</DialogDescription>
              </DialogHeader>
              <MeasurementForm profile={profile} onSuccess={handleAddSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="table">
          <TabsList className="mb-4">
            <TabsTrigger value="table">{t("tableView")}</TabsTrigger>
            <TabsTrigger value="charts">{t("chartsView")}</TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            {measurements.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <p>{t("emptyTable")}</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("date")}</TableHead>
                      <TableHead>{t("weightKg")}</TableHead>
                      <TableHead>{t("bodyFatPercent")}</TableHead>
                      <TableHead>{t("chestCm")}</TableHead>
                      <TableHead>{t("waistCm")}</TableHead>
                      <TableHead>{t("hipsCm")}</TableHead>
                      <TableHead>{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {measurements.map((measurement) => (
                      <TableRow key={measurement.id}>
                        <TableCell>
                          {format(new Date(measurement.date), "PP")}
                        </TableCell>
                        <TableCell>{measurement.weight_kg || "-"}</TableCell>
                        <TableCell>
                          {measurement.body_fat_percentage || "-"}
                        </TableCell>
                        <TableCell>{measurement.chest_cm || "-"}</TableCell>
                        <TableCell>{measurement.waist_cm || "-"}</TableCell>
                        <TableCell>{measurement.hips_cm || "-"}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedMeasurementId(measurement.id);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDelete(measurement.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="charts">
            {measurements.length < 2 ? (
              <div className="text-center p-8 text-muted-foreground">
                <p>{t("emptyCharts")}</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    {t("weightBodyFatChart")}
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <CustomLineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="weight"
                          name={t("weightLegend")}
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="bodyFat"
                          name={t("bodyFatLegend")}
                          stroke="#82ca9d"
                        />
                      </CustomLineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">
                    {t("bodyMeasurementsChart")}
                  </h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <CustomLineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="chest"
                          name={t("chestLegend")}
                          stroke="#8884d8"
                        />
                        <Line
                          type="monotone"
                          dataKey="waist"
                          name={t("waistLegend")}
                          stroke="#82ca9d"
                        />
                        <Line
                          type="monotone"
                          dataKey="hips"
                          name={t("hipsLegend")}
                          stroke="#ffc658"
                        />
                      </CustomLineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">{t("armsLegsChart")}</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <CustomLineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="armLeft"
                          name={t("leftArmLegend")}
                          stroke="#8884d8"
                        />
                        <Line
                          type="monotone"
                          dataKey="armRight"
                          name={t("rightArmLegend")}
                          stroke="#82ca9d"
                        />
                        <Line
                          type="monotone"
                          dataKey="thighLeft"
                          name={t("leftThighLegend")}
                          stroke="#ffc658"
                        />
                        <Line
                          type="monotone"
                          dataKey="thighRight"
                          name={t("rightThighLegend")}
                          stroke="#ff8042"
                        />
                      </CustomLineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Edit Measurement Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t("editDialogTitle")}</DialogTitle>
            <DialogDescription>{t("editDialogDescription")}</DialogDescription>
          </DialogHeader>
          {selectedMeasurement && (
            <MeasurementForm
              measurement={selectedMeasurement}
              profile={profile}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
