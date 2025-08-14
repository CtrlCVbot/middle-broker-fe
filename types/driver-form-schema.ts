import * as z from "zod";
import { VehicleType, TonnageType, DriverStatus } from "./broker-driver";

/**
 * 새로운 차주 등록 폼 스키마 (단일 화면 구조)
 */
export const driverRegisterSchema = z.object({
  // 기본 정보 (필수)
  name: z.string().min(1, "차주명은 필수입니다"),
  phone: z.string().min(1, "연락처는 필수입니다"),
  vehicleNumber: z.string().min(1, "차량번호는 필수입니다"),
  vehicleType: z.string().min(1, "차량종류는 필수입니다"),
  tonnage: z.string().min(1, "톤수는 필수입니다"),
  businessNumber: z.string().optional(),
  
  // 추가 정보 (선택)
  bankCode: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountHolder: z.string().optional(),
  cargoBoxType: z.string().optional(),
  cargoBoxLength: z.string().optional(),
  manufactureYear: z.string().optional(),
  
  // 특이사항 (선택)
  notes: z.array(z.object({
    id: z.string(),
    content: z.string().min(1, "특이사항 내용은 필수입니다"),
    date: z.date(),
  })).default([]),
});

/**
 * 폼 데이터 타입
 */
export type DriverFormValues = z.infer<typeof driverRegisterSchema>;

/**
 * 기본 정보 섹션 스키마
 */
export const basicInfoSchema = z.object({
  name: z.string().min(1, "차주명은 필수입니다"),
  phone: z.string().min(1, "연락처는 필수입니다"),
  vehicleNumber: z.string().min(1, "차량번호는 필수입니다"),
  vehicleType: z.string().min(1, "차량종류는 필수입니다"),
  tonnage: z.string().min(1, "톤수는 필수입니다"),
  businessNumber: z.string().optional(),
});

/**
 * 추가 정보 섹션 스키마
 */
export const additionalInfoSchema = z.object({
  bankCode: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountHolder: z.string().optional(),
  cargoBoxType: z.string().optional(),
  cargoBoxLength: z.string().optional(),
  manufactureYear: z.string().optional(),
});

/**
 * 특이사항 섹션 스키마
 */
export const notesSchema = z.object({
  notes: z.array(z.object({
    id: z.string(),
    content: z.string().min(1, "특이사항 내용은 필수입니다"),
    date: z.date(),
  })).default([]),
});

/**
 * 필수 필드만 검증하는 스키마
 */
export const requiredFieldsSchema = z.object({
  name: z.string().min(1, "차주명은 필수입니다"),
  phone: z.string().min(1, "연락처는 필수입니다"),
  vehicleNumber: z.string().min(1, "차량번호는 필수입니다"),
  vehicleType: z.string().min(1, "차량종류는 필수입니다"),
  tonnage: z.string().min(1, "톤수는 필수입니다"),
});

/**
 * 폼 기본값
 */
export const getFormDefaultValues = (driver?: any): DriverFormValues => {
  if (driver) {
    // 수정 모드
    return {
      name: driver.name || "",
      phone: driver.phoneNumber || "",
      vehicleNumber: driver.vehicleNumber || "",
      vehicleType: driver.vehicleType || "",
      tonnage: driver.tonnage || "",
      businessNumber: driver.businessNumber || "",
      bankCode: driver.bankCode || "",
      bankAccountNumber: driver.bankAccountNumber || "",
      bankAccountHolder: driver.bankAccountHolder || "",
      cargoBoxType: driver.cargoBox?.type || "",
      cargoBoxLength: driver.cargoBox?.length || "",
      manufactureYear: driver.manufactureYear || "",
      notes: driver.notes || [],
    };
  }
  
  // 신규 등록 모드
  return {
    name: "",
    phone: "",
    vehicleNumber: "",
    vehicleType: "",
    tonnage: "",
    businessNumber: "",
    bankCode: "",
    bankAccountNumber: "",
    bankAccountHolder: "",
    cargoBoxType: "",
    cargoBoxLength: "",
    manufactureYear: "",
    notes: [],
  };
}; 