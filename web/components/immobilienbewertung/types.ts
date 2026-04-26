"use client";

export type StepId = "propertyType" | "detail" | "size";

export type PropertyType = "wohnung" | "haus" | "grundstueck" | "gewerbe" | null;

export type HouseType = "efh" | "dhh" | "rmh" | "reh" | "mfh" | null;

export type ApartmentType =
  | "dachgeschoss"
  | "erdgeschoss"
  | "etagen"
  | "maisonette"
  | "penthouse"
  | "loft"
  | null;
