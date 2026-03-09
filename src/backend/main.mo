import Map "mo:core/Map";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import MixinStorage "blob-storage/Mixin";
import Authorization "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  include MixinStorage();
  let accessControlState = Authorization.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type Profile = {
    name : Text;
    mobile : Text;
    email : Text;
  };

  let profiles = Map.empty<Principal, Profile>();

  public query ({ caller }) func getCallerUserProfile() : async ?Profile {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their profiles");
    };
    profiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?Profile {
    if (caller != user and not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    profiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : Profile) : async () {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    profiles.add(caller, profile);
  };

  // Student registration
  public type StudentRegistration = {
    id : Nat;
    name : Text;
    mobile : Text;
    aadhaarNumber : Text;
    address : Text;
    email : Text;
    photoKey : Text;
    registrationDate : Int;
  };

  module StudentRegistration {
    public func compareByRegistrationDate(a : StudentRegistration, b : StudentRegistration) : Order.Order {
      Int.compare(a.registrationDate, b.registrationDate);
    };
  };

  let registrations = Map.empty<Nat, StudentRegistration>();
  var registrationId = 0;

  public shared ({ caller }) func createRegistration(name : Text, mobile : Text, aadhaarNumber : Text, address : Text, email : Text, photoKey : Text) : async Nat {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only users can attempt to create a registration");
    };

    registrationId += 1;
    let newRegistration : StudentRegistration = {
      id = registrationId;
      name;
      mobile;
      aadhaarNumber;
      address;
      email;
      photoKey;
      registrationDate = Time.now();
    };
    registrations.add(registrationId, newRegistration);
    registrationId;
  };

  public query ({ caller }) func getRegistrations() : async [StudentRegistration] {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can get all registrations");
    };
    registrations.values().toArray();
  };

  public query ({ caller }) func getOwnRegistrations() : async [StudentRegistration] {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only users can attempt to get their own registrations");
    };

    let profile = switch (profiles.get(caller)) {
      case (?p) { p };
      case (null) { Runtime.trap("Profile not found for caller") };
    };

    registrations.values().toArray().filter(func(r) { r.mobile == profile.mobile });
  };

  public shared ({ caller }) func deleteRegistration(id : Nat) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admin can attempt to delete registrations");
    };
    registrations.remove(id);
  };

  // Seat management
  public type Seat = {
    seatNumber : Nat;
    isBlocked : Bool;
  };

  let seatStates = Map.empty<Nat, Bool>();

  public shared ({ caller }) func blockSeat(seatNumber : Nat) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admin can attempt to block seats");
    };
    if (seatNumber < 1 or seatNumber > 100) {
      Runtime.trap("Invalid seat number");
    };
    seatStates.add(seatNumber, true);
  };

  public shared ({ caller }) func unblockSeat(seatNumber : Nat) : async () {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admin can attempt to unblock seats");
    };
    if (seatNumber < 1 or seatNumber > 100) {
      Runtime.trap("Invalid seat number");
    };
    seatStates.add(seatNumber, false);
  };

  public query ({ caller }) func getSeatStates() : async [Seat] {
    if (not (Authorization.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("The seat state can only be viewed by users");
    };
    Array.tabulate<Seat>(
      100,
      func(i) {
        let seatNumber = i + 1;
        {
          seatNumber;
          isBlocked = switch (seatStates.get(seatNumber)) {
            case (?status) { status };
            case (null) { false };
          };
        };
      },
    );
  };

  public query ({ caller }) func getTodaysRegistrations() : async [StudentRegistration] {
    if (not Authorization.isAdmin(accessControlState, caller)) {
      Runtime.trap("Only admin can attempt to get today's registrations");
    };
    let currentTime = Time.now();
    registrations.values().toArray().filter(
      func(r) {
        let diff = currentTime - r.registrationDate;
        diff >= 0 and diff < 24 * 60 * 60 * 1000000000;
      }
    );
  };
};
